const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async (req, res, next) => {
  try {
    let token;
    let user;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.session && req.session.userId) {
      user = await User.findById(req.session.userId);
      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    }


    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {

      const config = require('../config/environment');
      const jwtSecret = process.env.JWT_SECRET || config.jwtPrivateKey || 'your-jwt-secret';
      const decoded = jwt.verify(token, jwtSecret);

      user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};


exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (roles.length === 0) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    let user;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.session && req.session.userId) {
      user = await User.findOne({ _id: req.session.userId, isActive: true });
      if (user) {
        req.user = user;
      }
      return next();
    }

    if (token) {
      try {
        const config = require('../config/environment');
        const jwtSecret = process.env.JWT_SECRET || config.jwtPrivateKey || 'your-jwt-secret';
        const decoded = jwt.verify(token, jwtSecret);
        user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      } catch (error) {

        console.log('Invalid token, continuing as guest');
      }
    }

    next();
  } catch (error) {
    next();
  }
};

exports.checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${resourceType}`);
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`
        });
      }


      if (req.user.role === 'admin' || req.user.role === 'super-admin') {
        req.resource = resource;
        return next();
      }


      if (resource.user && resource.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};
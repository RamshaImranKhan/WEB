require('dotenv').config();

module.exports = {
  jwtPrivateKey: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production-12345',
  db: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/final-web',
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production-12345'
};

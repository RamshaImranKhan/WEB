
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/final-web';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@becoffee.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const createAdminUser = async () => {
  try {

    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB');

    await User.deleteMany({ email: ADMIN_EMAIL });
    console.log('Removed any existing admin users with this email');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const newAdmin = await User.create({
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    console.log('\nAdmin user created successfully:');
    console.log('-----------------------------');
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('Role: admin\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
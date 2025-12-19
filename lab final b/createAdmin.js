const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {

    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/final-web';
    await mongoose.connect(mongoURI);
    console.log('connected to MongoDB');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const existingAdmin = await User.findOne({ email: 'admin@becoffee.com' });

    if (existingAdmin) {
      console.log(' Admin user already exists. Deleting old admin...');
      await User.deleteOne({ email: 'admin@becoffee.com' });
      console.log(' Old admin deleted');
    }

    // Create new admin user with hashed password
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@becoffee.com',
      password: 'admin123', // Will be automatically hashed by the User model
      role: 'admin',
      isActive: true
    });


    console.log('Admin user created successfully!');

    console.log('Email:    admin@becoffee.com');
    console.log('Password: admin123');

    console.log('IMPORTANT: Please change this password after first login!');


    await mongoose.connection.close();
    console.log(' Database connection closed');
    process.exit(0);

  } catch (error) {

    console.error('Error creating admin user:');
    console.error(error.message);


    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();
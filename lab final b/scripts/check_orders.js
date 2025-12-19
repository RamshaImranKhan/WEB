const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
require('dotenv').config();

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_STRING || 'mongodb://localhost:27017/final-web');
        console.log('Connected to DB');

        const orderCount = await Order.countDocuments();
        console.log(`Total Orders in DB: ${orderCount}`);

        const orders = await Order.find().limit(3);
        console.log('Sample Orders:', orders);

        if (orderCount === 0) {
            console.log('Creating dummy order...');
            const user = await User.findOne();
            if (!user) {
                console.log('No users found to assign order to.');
            } else {
                const order = new Order({
                    user: user._id,
                    orderNumber: 'ORD-TEST-001',
                    items: [],
                    totalAmount: 50.00,
                    orderStatus: 'Placed',
                    paymentMethod: 'cash',
                    shippingAddress: {
                        fullName: 'Test User',
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'Test State',
                        zipCode: '12345',
                        country: 'Test Country',
                        phone: '1234567890'
                    }
                });
                await order.save();
                console.log('Dummy order created.');
            }
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkOrders();

const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const config = require('../config/environment');

// Mock request and response for middleware testing if needed, 
// but here we will test via logic simulation or just db setup
// Actually, let's just use this to verify the DB state or create test data
// and then use curl to hit the endpoint.

const run = async () => {
    try {
        await mongoose.connect(config.db);
        console.log('Connected to DB');

        // 1. Create a dummy product
        const product = await Product.findOneAndUpdate(
            { name: 'Test Coffee' },
            {
                name: 'Test Coffee',
                price: 100,
                stock: 100,
                category: new mongoose.Types.ObjectId(), // Fake category ID
                description: 'Test'
            },
            { upsert: true, new: true }
        );
        console.log('Product created:', product._id);

        // 2. Create a cart for "guest" (since we can't easily mock session in curl without work)
        // Wait, the app uses req.session.userId || 'guest'
        // If I don't send a cookie, it might be undefined or new session.
        // routes/cart.js: const userId = req.session.userId || 'guest';
        // If session is new, userId is undefined? No, express-session doesn't set userId automatically.
        // So it will be 'guest'.

        // Let's ensure a cart exists for 'guest'
        await Cart.findOneAndDelete({ userId: 'guest' });
        const cart = await Cart.create({
            userId: 'guest',
            items: [{ product: product._id, quantity: 2 }] // Total 200
        });
        console.log('Cart created for guest');

        console.log('Ready for CURL testing');
        console.log('Run: curl "http://localhost:3000/order/preview?coupon=SAVE10"');

        // We can also programmatically test the middleware logic here just to be sure
        const req = {
            query: { coupon: 'SAVE10' },
            body: {},
            discount: {}
        };
        const res = {};
        const next = () => { };

        const applyDiscount = require('../middlewares/applyDiscount');
        applyDiscount(req, res, next);

        if (req.discount.percent === 0.1 && req.discount.code === 'SAVE10') {
            console.log('Middleware Unit Test: PASSED');
        } else {
            console.error('Middleware Unit Test: FAILED', req.discount);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

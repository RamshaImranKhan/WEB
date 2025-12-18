# Final Web Application

A Node.js/Express e-commerce application with MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

A `.env` file has been created. Update it if needed:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/final-web
JWT_SECRET=your-secret-key-change-this-in-production-12345
JWT_EXPIRE=7d
```

### 3. Start MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is installed and running on your system
- Default connection: `mongodb://localhost:27017/final-web`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGO_URI` in `.env` file

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 5. Access the Application

Once the server starts, open your browser and visit:

- **Main Site:** http://localhost:3000
- **API Root:** http://localhost:3000/api
- **API Documentation:** 
  - Users: http://localhost:3000/api/users
  - Products: http://localhost:3000/api/products
  - Cart: http://localhost:3000/api/cart
  - Orders: http://localhost:3000/api/orders
  - Admin: http://localhost:3000/api/admin

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart` - Add item to cart (requires auth)
- `PUT /api/cart/:itemId` - Update cart item (requires auth)
- `DELETE /api/cart/:itemId` - Remove item from cart (requires auth)

### Orders
- `GET /api/orders` - Get orders (requires auth)
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders/:id` - Get single order (requires auth)

## Troubleshooting

- **MongoDB Connection Error:** Make sure MongoDB is running or update the `MONGO_URI` in `.env`
- **Port Already in Use:** Change the `PORT` in `.env` file
- **Module Not Found:** Run `npm install` again


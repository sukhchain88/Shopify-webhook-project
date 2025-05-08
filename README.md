# Shopify Webhook Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Database Models](#database-models)
   - [User Model](#user-model)
   - [Webhook Model](#webhook-model)
   - [Customer Model](#customer-model)
   - [Order Model](#order-model)
4. [Controllers](#controllers)
   - [Webhook Controller](#webhook-controller)
   - [User Controller](#user-controller)
   - [Customer Controller](#customer-controller)
   - [Order Controller](#order-controller)
   - [Product Controller](#product-controller)
5. [Routes](#routes)
   - [Webhook Routes](#webhook-routes)
   - [User Routes](#user-routes)
   - [Customer Routes](#customer-routes)
   - [Order Routes](#order-routes)
   - [Product Routes](#product-routes)
6. [API Endpoints](#api-endpoints)
7. [Database Relationships](#database-relationships)
8. [How to Use](#how-to-use)
9. [Best Practices](#best-practices)

## Project Overview

This project is a Shopify webhook handler that receives webhooks from Shopify and stores the data in a PostgreSQL database. It also provides API endpoints to manage users, customers, orders, and products.

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── config.ts     # Environment variables
│   └── db.ts         # Database connection
├── controllers/      # Business logic
│   ├── customer.controller.ts
│   ├── order.controller.ts
│   ├── product.controller.ts
│   ├── shopify.controller.ts
│   ├── user.controller.ts
│   └── webhook.controller.ts
├── models/           # Database models
│   ├── customer.ts
│   ├── order.ts
│   ├── user.ts
│   └── webhook.ts
├── routes/           # API routes
│   ├── customer.routes.ts
│   ├── order.routes.ts
│   ├── products.routes.ts
│   ├── shopify.routes.ts
│   ├── user.routes.ts
│   └── webhook.routes.ts
├── services/         # External service integrations
│   ├── shopifyService.ts
│   └── webhookService.ts
├── types/            # TypeScript type definitions
│   └── shopifyInterface.ts
├── index.ts          # Main application file
└── view-users.ts     # Utility to view users
```

## Database Models

### User Model

```typescript
// src\models\user.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db.ts";

export const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'user',
  },
  shop_domain: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  access_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "users",
  timestamps: true,
  underscored: true,
});

export default User;
```

### Webhook Model

```typescript
// src\models\webhook.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db.ts";

export const Webhook = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  shop_domain: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  access_token: {
    type: DataTypes.STRING(255),
    allowNull: true, 
  },
}, {
  tableName: "users", 
  timestamps: true,   
});
```

### Customer Model

```typescript
// src\models\customer.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db.ts";

export const Customer = sequelize.define("customers", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  shop_domain: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  zip: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  shopify_customer_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "customers",
  timestamps: true,
  underscored: true,
});
```

### Order Model

```typescript
// src\models\order.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db.ts";
import { Customer } from "./customer.ts";

export const Order = sequelize.define("orders", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  shop_domain: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Customer,
      key: 'id'
    }
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'USD',
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  shopify_order_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "orders",
  timestamps: true,
  underscored: true,
});

// Define the relationship between Order and Customer
Order.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Order, { foreignKey: 'customer_id' });
```

## Controllers

### Webhook Controller

```typescript
// src\controllers\webhook.controller.ts
import { Request, Response } from "express";
import { Webhook } from "../models/webhook.ts";

export const handleWebhook = async (req: Request, res: Response) => {
  console.log("🔔 Webhook received:", {
    headers: req.headers,
    body: req.body
  });

  // Get headers or use default values for testing
  const topic = req.headers["x-shopify-topic"] as string || req.body.topic || "test";
  const shopDomain = req.headers["x-shopify-shop-domain"] as string || req.body.shop_domain || "test-shop.myshopify.com";
  const payload = req.body;

  // For testing purposes, we'll allow the shop domain to come from the body
  if (!shopDomain) {
    console.error("❌ Missing shop domain in headers or body");
    return res.status(400).json({ error: "Missing shop domain in headers or body" });
  }

  try {
    // Create a new entry for each webhook
    const webhook = await Webhook.create({
      topic: topic,
      shop_domain: shopDomain,
      name: payload?.customer?.first_name || null,
      email: payload?.email || payload?.customer?.email || null,
      access_token: payload?.access_token || null,
    });

    console.log("✅ Webhook created:", webhook.toJSON());
    return res.status(200).json({
      message: "✅ Webhook received and saved.",
      webhook,
    });
  } catch (err) {
    console.error("❌ Error saving webhook:", err);
    return res.status(500).json({ error: "Error processing webhook", details: (err as Error).message });
  }
};
```

### User Controller

```typescript
// src\controllers\user.controller.ts
import { Request, Response } from "express";
import { User } from "../models/user.ts";

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      raw: true,
      logging: console.log
    });

    console.log("📄 Users Table Data:");
    console.table(users);

    return res.status(200).json({
      message: "Users retrieved successfully",
      data: users
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    return res.status(500).json({ 
      error: "Failed to fetch users", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Get a single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      data: user
    });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    return res.status(500).json({ 
      error: "Failed to fetch user", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    if (!userData.name || !userData.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const user = await User.create(userData);
    
    console.log("✅ User created:", user.toJSON());
    
    return res.status(201).json({
      message: "User created successfully",
      data: user
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    return res.status(500).json({ 
      error: "Failed to create user", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Update a user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await user.update(userData);
    
    console.log("✅ User updated:", user.toJSON());
    
    return res.status(200).json({
      message: "User updated successfully",
      data: user
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    return res.status(500).json({ 
      error: "Failed to update user", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await user.destroy();
    
    console.log("✅ User deleted:", id);
    
    return res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    return res.status(500).json({ 
      error: "Failed to delete user", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};
```

### Customer Controller

```typescript
// src\controllers\customer.controller.ts
import { Request, Response } from "express";
import { Customer } from "../models/customer.ts";

// Get all customers
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.findAll({
      raw: true,
      logging: console.log
    });

    console.log("📄 Customers Table Data:");
    console.table(customers);

    return res.status(200).json({
      message: "Customers retrieved successfully",
      data: customers
    });
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    return res.status(500).json({ 
      error: "Failed to fetch customers", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Get a single customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(200).json({
      message: "Customer retrieved successfully",
      data: customer
    });
  } catch (err) {
    console.error("❌ Error fetching customer:", err);
    return res.status(500).json({ 
      error: "Failed to fetch customer", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData = req.body;
    
    // Validate required fields
    if (!customerData.shop_domain) {
      return res.status(400).json({ error: "Shop domain is required" });
    }

    const customer = await Customer.create(customerData);
    
    console.log("✅ Customer created:", customer.toJSON());
    
    return res.status(201).json({
      message: "Customer created successfully",
      data: customer
    });
  } catch (err) {
    console.error("❌ Error creating customer:", err);
    return res.status(500).json({ 
      error: "Failed to create customer", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Update a customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerData = req.body;
    
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    await customer.update(customerData);
    
    console.log("✅ Customer updated:", customer.toJSON());
    
    return res.status(200).json({
      message: "Customer updated successfully",
      data: customer
    });
  } catch (err) {
    console.error("❌ Error updating customer:", err);
    return res.status(500).json({ 
      error: "Failed to update customer", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Delete a customer
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    await customer.destroy();
    
    console.log("✅ Customer deleted:", id);
    
    return res.status(200).json({
      message: "Customer deleted successfully"
    });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    return res.status(500).json({ 
      error: "Failed to delete customer", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};
```

### Order Controller

```typescript
// src\controllers\order.controller.ts
import { Request, Response } from "express";
import { Order } from "../models/order.ts";
import { Customer } from "../models/customer.ts";

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Customer,
          attributes: ['first_name', 'last_name', 'email']
        }
      ],
      raw: true,
      logging: console.log
    });

    console.log("📄 Orders Table Data:");
    console.table(orders);

    return res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders
    });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return res.status(500).json({ 
      error: "Failed to fetch orders", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          attributes: ['first_name', 'last_name', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({
      message: "Order retrieved successfully",
      data: order
    });
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    return res.status(500).json({ 
      error: "Failed to fetch order", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.shop_domain || !orderData.order_number) {
      return res.status(400).json({ error: "Shop domain and order number are required" });
    }

    const order = await Order.create(orderData);
    
    console.log("✅ Order created:", order.toJSON());
    
    return res.status(201).json({
      message: "Order created successfully",
      data: order
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return res.status(500).json({ 
      error: "Failed to create order", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Update an order
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderData = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    await order.update(orderData);
    
    console.log("✅ Order updated:", order.toJSON());
    
    return res.status(200).json({
      message: "Order updated successfully",
      data: order
    });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    return res.status(500).json({ 
      error: "Failed to update order", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    await order.destroy();
    
    console.log("✅ Order deleted:", id);
    
    return res.status(200).json({
      message: "Order deleted successfully"
    });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    return res.status(500).json({ 
      error: "Failed to delete order", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};
```

## Routes

### Webhook Routes

```typescript
// src\routes\webhook.routes.ts
import express, { RequestHandler } from "express";
import { verifyShopifyWebhook } from "../middleware/verifyShopifyWebhook.ts";
import { handleWebhook } from "../controllers/webhook.controller.ts";
import { viewUsers } from "../view-users.ts";

const router = express.Router();

// Configure route to handle raw body data for webhook verification
router.post("/", 
  // Comment out verification for testing
  // verifyShopifyWebhook as RequestHandler,
  handleWebhook as unknown as RequestHandler
);

router.get("/users", viewUsers as RequestHandler);

export default router;
```

### User Routes

```typescript
// src\routes\user.routes.ts
import express, { RequestHandler } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/user.controller.ts';

const userRoutes = express.Router();

// GET all users
userRoutes.get('/users', getAllUsers as unknown as RequestHandler);

// GET a single user by ID
userRoutes.get('/users/:id', getUserById as unknown as RequestHandler);

// POST create a new user
userRoutes.post('/users', createUser as unknown as RequestHandler);

// PUT update a user
userRoutes.put('/users/:id', updateUser as unknown as RequestHandler);

// DELETE a user
userRoutes.delete('/users/:id', deleteUser as unknown as RequestHandler);

export default userRoutes;
```

### Customer Routes

```typescript
// src\routes\customer.routes.ts
import express, { RequestHandler } from 'express';
import { 
  getAllCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../controllers/customer.controller.ts';

const customerRoutes = express.Router();

// GET all customers
customerRoutes.get('/customers', getAllCustomers as unknown as RequestHandler);

// GET a single customer by ID
customerRoutes.get('/customers/:id', getCustomerById as unknown as RequestHandler);

// POST create a new customer
customerRoutes.post('/customers', createCustomer as unknown as RequestHandler);

// PUT update a customer
customerRoutes.put('/customers/:id', updateCustomer as unknown as RequestHandler);

// DELETE a customer
customerRoutes.delete('/customers/:id', deleteCustomer as unknown as RequestHandler);

export default customerRoutes;
```

### Order Routes

```typescript
// src\routes\order.routes.ts
import express, { RequestHandler } from 'express';
import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder 
} from '../controllers/order.controller.ts';

const orderRoutes = express.Router();

// GET all orders
orderRoutes.get('/orders', getAllOrders as unknown as RequestHandler);

// GET a single order by ID
orderRoutes.get('/orders/:id', getOrderById as unknown as RequestHandler);

// POST create a new order
orderRoutes.post('/orders', createOrder as unknown as RequestHandler);

// PUT update an order
orderRoutes.put('/orders/:id', updateOrder as unknown as RequestHandler);

// DELETE an order
orderRoutes.delete('/orders/:id', deleteOrder as unknown as RequestHandler);

export default orderRoutes;
```

## API Endpoints

### Webhook Endpoints

- `POST /webhooks`: Receive webhooks from Shopify

### User Endpoints

- `GET /users`: Get all users
- `GET /users/:id`: Get a specific user by ID
- `POST /users`: Create a new user
- `PUT /users/:id`: Update an existing user
- `DELETE /users/:id`: Delete a user

### Customer Endpoints

- `GET /customers`: Get all customers
- `GET /customers/:id`: Get a specific customer by ID
- `POST /customers`: Create a new customer
- `PUT /customers/:id`: Update an existing customer
- `DELETE /customers/:id`: Delete a customer

### Order Endpoints

- `GET /orders`: Get all orders
- `GET /orders/:id`: Get a specific order by ID
- `POST /orders`: Create a new order
- `PUT /orders/:id`: Update an existing order
- `DELETE /orders/:id`: Delete an order

## Database Relationships

The project uses Sequelize ORM to define relationships between models:

1. **Order to Customer**: One-to-Many relationship
   - One customer can have many orders
   - Each order belongs to one customer
   - Defined using `Order.belongsTo(Customer)` and `Customer.hasMany(Order)`

## How to Use

### View All Users

Visit `http://localhost:3000/users` in your browser to see all users.

### Create a New User

Send a POST request to `http://localhost:3000/users` with JSON data:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "admin",
  "shop_domain": "your-shop.myshopify.com"
}
```

### View All Customers

Visit `http://localhost:3000/customers` in your browser to see all customers.

### Create a New Customer

Send a POST request to `http://localhost:3000/customers` with JSON data:

```json
{
  "shop_domain": "your-shop.myshopify.com",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "city": "New York",
  "province": "NY",
  "country": "USA",
  "zip": "10001"
}
```

### View All Orders

Visit `http://localhost:3000/orders` in your browser to see all orders.

### Create a New Order

Send a POST request to `http://localhost:3000/orders` with JSON data:

```json
{
  "shop_domain": "your-shop.myshopify.com",
  "order_number": "1001",
  "customer_id": 1,
  "total_price": "99.99",
  "currency": "USD",
  "status": "pending"
}
```

## Best Practices

1. **Separation of Concerns**:
   - Models: Define the database structure
   - Controllers: Handle the business logic
   - Routes: Define the API endpoints

2. **Consistent Error Handling**:
   - All controllers follow the same pattern for error handling
   - Detailed error messages are returned to the client

3. **Data Validation**:
   - Required fields are checked before creating or updating records
   - Appropriate error messages are returned if validation fails

4. **Relationships**:
   - Orders are linked to customers through the customer_id field
   - When fetching orders, customer information is included

5. **Logging**:
   - Console logs are used to track operations
   - Tables are displayed in the console for easy viewing

6. **File Structure**:
   - Organized by feature (models, controllers, routes)
   - Clear naming conventions
   - Consistent file organization 
// src\routes\order.routes.ts
import express, { RequestHandler } from 'express';
import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder 
} from '../controllers/order.controller.js';

const router = express.Router();

// No need to add /orders prefix as it's already in the path
// GET all orders
router.get('/', getAllOrders as unknown as RequestHandler);

// GET a single order by ID
router.get('/:id', getOrderById as unknown as RequestHandler);

// POST create a new order
router.post('/', createOrder as unknown as RequestHandler);

// PUT update an order
router.put('/:id', updateOrder as unknown as RequestHandler);

// DELETE an order
router.delete('/:id', deleteOrder as unknown as RequestHandler);

export default router; 
 
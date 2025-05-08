// src\routes\customer.routes.ts
import express, { RequestHandler } from 'express';
import { 
  getAllCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../controllers/customer.controller.js';

const router = express.Router();

// No need to add /customers prefix as it's already in the path
// GET all customers
router.get('/', getAllCustomers as unknown as RequestHandler);

// GET a single customer by ID
router.get('/:id', getCustomerById as unknown as RequestHandler);

// POST create a new customer
router.post('/', createCustomer as unknown as RequestHandler);

// PUT update a customer
router.put('/:id', updateCustomer as unknown as RequestHandler);

// DELETE a customer
router.delete('/:id', deleteCustomer as unknown as RequestHandler);

export default router; 
 
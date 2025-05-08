// src\routes\customer.routes.ts
import express from 'express';
import { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customer.controller.js';
const router = express.Router();
// No need to add /customers prefix as it's already in the path
// GET all customers
router.get('/', getAllCustomers);
// GET a single customer by ID
router.get('/:id', getCustomerById);
// POST create a new customer
router.post('/', createCustomer);
// PUT update a customer
router.put('/:id', updateCustomer);
// DELETE a customer
router.delete('/:id', deleteCustomer);
export default router;

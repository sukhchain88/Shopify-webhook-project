// src\routes\customer.routes.ts
import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  syncCustomers
} from "../controllers/CustomerController.js";

const customerRoutes = express.Router();

// Create a new customer
customerRoutes.post("/", createCustomer);

// Get all customers with pagination and search
customerRoutes.get("/", getAllCustomers);

// Get a single customer by ID
customerRoutes.get("/:id", getCustomerById);

// Update a customer
customerRoutes.put("/:id", updateCustomer);

// Delete a customer
customerRoutes.delete("/:id", deleteCustomer);

// Sync customers from Shopify
customerRoutes.post("/sync", syncCustomers);

export default customerRoutes; 
 
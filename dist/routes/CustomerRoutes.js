"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src\routes\customer.routes.ts
const express_1 = __importDefault(require("express"));
const CustomerController_js_1 = require("../controllers/CustomerController.js");
const customerRoutes = express_1.default.Router();
// Create a new customer
customerRoutes.post("/", CustomerController_js_1.createCustomer);
// Get all customers with pagination and search
customerRoutes.get("/", CustomerController_js_1.getAllCustomers);
// Get a single customer by ID
customerRoutes.get("/:id", CustomerController_js_1.getCustomerById);
// Update a customer
customerRoutes.put("/:id", CustomerController_js_1.updateCustomer);
// Delete a customer
customerRoutes.delete("/:id", CustomerController_js_1.deleteCustomer);
// Sync customers from Shopify
customerRoutes.post("/sync", CustomerController_js_1.syncCustomers);
exports.default = customerRoutes;

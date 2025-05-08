import { Customer } from "../models/customer.js";
// Get all customers
export const getAllCustomers = async (req, res) => {
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
    }
    catch (err) {
        console.error("❌ Error fetching customers:", err);
        return res.status(500).json({
            error: "Failed to fetch customers",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Get a single customer by ID
export const getCustomerById = async (req, res) => {
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
    }
    catch (err) {
        console.error("❌ Error fetching customer:", err);
        return res.status(500).json({
            error: "Failed to fetch customer",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Create a new customer
export const createCustomer = async (req, res) => {
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
    }
    catch (err) {
        console.error("❌ Error creating customer:", err);
        return res.status(500).json({
            error: "Failed to create customer",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Update a customer
export const updateCustomer = async (req, res) => {
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
    }
    catch (err) {
        console.error("❌ Error updating customer:", err);
        return res.status(500).json({
            error: "Failed to update customer",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Delete a customer
export const deleteCustomer = async (req, res) => {
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
    }
    catch (err) {
        console.error("❌ Error deleting customer:", err);
        return res.status(500).json({
            error: "Failed to delete customer",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};

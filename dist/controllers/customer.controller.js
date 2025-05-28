import { CustomerService } from "../services/customer.service.js";
import { validateCustomerApiInput, validateCustomerUpdateApiInput } from "../validators/customer.validator.js";
// Create a new customer
export const createCustomer = async (req, res) => {
    try {
        const validationResult = validateCustomerApiInput(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: "Validation failed",
                details: validationResult.error.errors
            });
            return;
        }
        // Transform the API data to database format
        const customerData = {
            first_name: validationResult.data.first_name || null,
            last_name: validationResult.data.last_name || null,
            email: validationResult.data.email,
            phone: validationResult.data.phone || null,
            shopify_customer_id: validationResult.data.shopify_customer_id || null,
            // Flatten address object to individual fields
            address: validationResult.data.address?.address1 || null,
            city: validationResult.data.address?.city || null,
            province: validationResult.data.address?.province || null,
            country: validationResult.data.address?.country || null,
            zip: validationResult.data.address?.zip || null,
            // Add default shop_domain for API-created customers
            shop_domain: process.env.SHOPIFY_STORE_URL || "api-created.myshopify.com"
        };
        const customer = await CustomerService.createCustomer(customerData);
        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });
    }
    catch (err) {
        console.error("❌ Error creating customer:", err);
        res.status(500).json({
            success: false,
            error: "Failed to create customer",
            message: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Get all customers with pagination
export const getAllCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        let result;
        if (search) {
            result = await CustomerService.searchCustomers(search, page, limit);
        }
        else {
            result = await CustomerService.getCustomers(page, limit);
        }
        res.status(200).json({
            success: true,
            message: "Customers retrieved successfully",
            ...result
        });
    }
    catch (err) {
        console.error("❌ Error fetching customers:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch customers",
            message: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Get a single customer by ID
export const getCustomerById = async (req, res) => {
    try {
        const customer = await CustomerService.getCustomerById(parseInt(req.params.id));
        res.status(200).json({
            success: true,
            message: "Customer retrieved successfully",
            data: customer
        });
    }
    catch (err) {
        console.error("❌ Error fetching customer:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch customer",
            message: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Update a customer
export const updateCustomer = async (req, res) => {
    try {
        const validationResult = validateCustomerUpdateApiInput(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: "Validation failed",
                details: validationResult.error.errors
            });
            return;
        }
        // Transform the API data to database format
        const updateData = {};
        if (validationResult.data.first_name !== undefined) {
            updateData.first_name = validationResult.data.first_name;
        }
        if (validationResult.data.last_name !== undefined) {
            updateData.last_name = validationResult.data.last_name;
        }
        if (validationResult.data.email !== undefined) {
            updateData.email = validationResult.data.email;
        }
        if (validationResult.data.phone !== undefined) {
            updateData.phone = validationResult.data.phone;
        }
        if (validationResult.data.shopify_customer_id !== undefined) {
            updateData.shopify_customer_id = validationResult.data.shopify_customer_id;
        }
        // Handle address object
        if (validationResult.data.address) {
            if (validationResult.data.address.address1 !== undefined) {
                updateData.address = validationResult.data.address.address1;
            }
            if (validationResult.data.address.city !== undefined) {
                updateData.city = validationResult.data.address.city;
            }
            if (validationResult.data.address.province !== undefined) {
                updateData.province = validationResult.data.address.province;
            }
            if (validationResult.data.address.country !== undefined) {
                updateData.country = validationResult.data.address.country;
            }
            if (validationResult.data.address.zip !== undefined) {
                updateData.zip = validationResult.data.address.zip;
            }
        }
        const customer = await CustomerService.updateCustomer(parseInt(req.params.id), updateData);
        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: customer
        });
    }
    catch (err) {
        console.error("❌ Error updating customer:", err);
        res.status(500).json({
            success: false,
            error: "Failed to update customer",
            message: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Delete a customer
export const deleteCustomer = async (req, res) => {
    try {
        await CustomerService.deleteCustomer(parseInt(req.params.id));
        res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });
    }
    catch (err) {
        console.error("❌ Error deleting customer:", err);
        res.status(500).json({
            success: false,
            error: "Failed to delete customer",
            message: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
// Sync customers from Shopify
export const syncCustomers = async (req, res) => {
    try {
        const count = await CustomerService.syncCustomersFromShopify();
        res.status(200).json({
            success: true,
            message: `Successfully synced ${count} customers from Shopify`
        });
    }
    catch (err) {
        console.error("❌ Error syncing customers:", err);
        res.status(500).json({
            success: false,
            error: "Failed to sync customers",
            message: err instanceof Error ? err.message : "Unknown error"
        });
    }
};

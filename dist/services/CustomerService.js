import { Customer } from "../models/Customer.js";
import { shopifyApiService } from "./ShopifyService.js";
import { Op } from "sequelize";
import { validateAndFormatPhone } from "../utils/phoneValidator.js";
export class CustomerService {
    static async findByShopifyId(shopifyId) {
        return await Customer.findOne({
            where: { shopify_customer_id: shopifyId }
        });
    }
    static async createCustomer(customerData) {
        try {
            const localCustomer = await Customer.create(customerData);
            let shopifyCustomer = null;
            try {
                const formattedPhone = validateAndFormatPhone(customerData.phone);
                const shopifyCustomerData = {
                    first_name: customerData.first_name,
                    last_name: customerData.last_name,
                    email: customerData.email,
                    addresses: customerData.address ? [{
                            address1: customerData.address,
                            city: customerData.city,
                            province: customerData.province,
                            country: customerData.country,
                            zip: customerData.zip
                        }] : []
                };
                if (formattedPhone) {
                    shopifyCustomerData.phone = formattedPhone;
                    console.log(`📞 Using formatted phone for Shopify: ${formattedPhone}`);
                }
                else if (customerData.phone) {
                    console.warn(`⚠️ Skipping invalid phone number for Shopify: ${customerData.phone}`);
                }
                const shopifyResponse = await shopifyApiService("POST", "customers.json", {
                    customer: shopifyCustomerData
                });
                await localCustomer.update({
                    shopify_customer_id: String(shopifyResponse.customer.id)
                });
                shopifyCustomer = shopifyResponse.customer;
                console.log("✅ Customer created in both local DB and Shopify");
            }
            catch (shopifyError) {
                console.warn("⚠️ Customer created locally but failed to sync to Shopify:", shopifyError instanceof Error ? shopifyError.message : shopifyError);
            }
            return {
                local: localCustomer,
                shopify: shopifyCustomer,
                synced_to_shopify: !!shopifyCustomer
            };
        }
        catch (error) {
            console.error("Failed to create customer:", error);
            throw error;
        }
    }
    static async updateCustomer(id, customerData) {
        try {
            const customer = await Customer.findByPk(id);
            if (!customer) {
                throw new Error("Customer not found");
            }
            await customer.update(customerData);
            let shopifyUpdated = false;
            const shopifyCustomerId = customer.get('shopify_customer_id');
            if (shopifyCustomerId) {
                try {
                    const formattedPhone = validateAndFormatPhone(customerData.phone);
                    const shopifyCustomerData = {
                        first_name: customerData.first_name,
                        last_name: customerData.last_name,
                        email: customerData.email,
                        addresses: customerData.address ? [{
                                address1: customerData.address,
                                city: customerData.city,
                                province: customerData.province,
                                country: customerData.country,
                                zip: customerData.zip
                            }] : undefined
                    };
                    if (formattedPhone) {
                        shopifyCustomerData.phone = formattedPhone;
                        console.log(`📞 Using formatted phone for Shopify update: ${formattedPhone}`);
                    }
                    else if (customerData.phone) {
                        console.warn(`⚠️ Skipping invalid phone number for Shopify update: ${customerData.phone}`);
                    }
                    await shopifyApiService("PUT", `customers/${shopifyCustomerId}.json`, {
                        customer: shopifyCustomerData
                    });
                    shopifyUpdated = true;
                    console.log("✅ Customer updated in both local DB and Shopify");
                }
                catch (shopifyError) {
                    console.warn("⚠️ Customer updated locally but failed to sync to Shopify:", shopifyError instanceof Error ? shopifyError.message : shopifyError);
                }
            }
            else {
                console.log("ℹ️ Customer updated locally (no Shopify ID to sync)");
            }
            return {
                local: customer,
                synced_to_shopify: shopifyUpdated
            };
        }
        catch (error) {
            console.error("Failed to update customer:", error);
            throw error;
        }
    }
    static async deleteCustomer(id) {
        try {
            const customer = await Customer.findByPk(id);
            if (!customer) {
                throw new Error("Customer not found");
            }
            let shopifyDeleted = false;
            const shopifyCustomerId = customer.get('shopify_customer_id');
            if (shopifyCustomerId) {
                try {
                    await shopifyApiService("DELETE", `customers/${shopifyCustomerId}.json`);
                    shopifyDeleted = true;
                    console.log("✅ Customer deleted from both local DB and Shopify");
                }
                catch (shopifyError) {
                    console.warn("⚠️ Customer will be deleted locally but failed to delete from Shopify:", shopifyError instanceof Error ? shopifyError.message : shopifyError);
                }
            }
            else {
                console.log("ℹ️ Customer deleted locally (no Shopify ID to sync)");
            }
            await customer.destroy();
            return {
                deleted: true,
                synced_to_shopify: shopifyDeleted
            };
        }
        catch (error) {
            console.error("Failed to delete customer:", error);
            throw error;
        }
    }
    static async getCustomers(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const customers = await Customer.findAndCountAll({
                limit,
                offset,
                order: [["createdAt", "DESC"]]
            });
            return {
                customers: customers.rows,
                pagination: {
                    total: customers.count,
                    page,
                    limit,
                    pages: Math.ceil(customers.count / limit)
                }
            };
        }
        catch (error) {
            console.error("Failed to fetch customers:", error);
            throw error;
        }
    }
    static async getCustomerById(id) {
        try {
            const customer = await Customer.findByPk(id);
            if (!customer) {
                throw new Error("Customer not found");
            }
            return customer;
        }
        catch (error) {
            console.error("Failed to fetch customer:", error);
            throw error;
        }
    }
    static async syncCustomersFromShopify() {
        try {
            const response = await shopifyApiService("GET", "customers.json");
            const shopifyCustomers = response.customers;
            for (const shopifyCustomer of shopifyCustomers) {
                await Customer.findOrCreate({
                    where: { shopify_customer_id: String(shopifyCustomer.id) },
                    defaults: {
                        shop_domain: shopifyCustomer.shop_domain,
                        first_name: shopifyCustomer.first_name,
                        last_name: shopifyCustomer.last_name,
                        email: shopifyCustomer.email,
                        phone: shopifyCustomer.phone,
                        shopify_customer_id: String(shopifyCustomer.id)
                    }
                });
            }
            return shopifyCustomers.length;
        }
        catch (error) {
            console.error("Failed to sync customers:", error);
            throw error;
        }
    }
    static async searchCustomers(query, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const customers = await Customer.findAndCountAll({
                where: {
                    [Op.or]: [
                        { email: { [Op.like]: `%${query}%` } },
                        { first_name: { [Op.like]: `%${query}%` } },
                        { last_name: { [Op.like]: `%${query}%` } }
                    ]
                },
                limit,
                offset,
                order: [["createdAt", "DESC"]]
            });
            return {
                customers: customers.rows,
                pagination: {
                    total: customers.count,
                    page,
                    limit,
                    pages: Math.ceil(customers.count / limit)
                }
            };
        }
        catch (error) {
            console.error("Failed to search customers:", error);
            throw error;
        }
    }
}

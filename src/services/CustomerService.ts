import { Customer } from "../models";
import { shopifyApiService } from "./ShopifyService";
import { CustomerData, ShopifyCustomerResponse, ShopifyCustomersResponse } from "../types/customerInterface";
import { CustomerInput } from "../validators/customer.validator";
import { Op } from "sequelize";
import { validateAndFormatPhone } from "../utils/phoneValidator";

export class CustomerService {
  /**
   * Find a customer by Shopify ID
   */
  static async findByShopifyId(shopifyId: string) {
    return await Customer.findOne({
      where: { shopify_customer_id: shopifyId }
    });
  }

  /**
   * Create a customer in both local database and Shopify
   */
  static async createCustomer(customerData: CustomerInput) {
    try {
      // First create in local database
      const localCustomer = await Customer.create(customerData);

      // Try to create in Shopify (optional - don't fail if this fails)
      let shopifyCustomer = null;
      try {
        // Validate and format phone number for Shopify
        const formattedPhone = validateAndFormatPhone(customerData.phone);
        
        // Prepare Shopify customer data
        const shopifyCustomerData: any = {
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

        // Only include phone if it's valid
        if (formattedPhone) {
          shopifyCustomerData.phone = formattedPhone;
          console.log(`📞 Using formatted phone for Shopify: ${formattedPhone}`);
        } else if (customerData.phone) {
          console.warn(`⚠️ Skipping invalid phone number for Shopify: ${customerData.phone}`);
        }

        const shopifyResponse = await shopifyApiService<ShopifyCustomerResponse>("POST", "customers.json", {
          customer: shopifyCustomerData
        });

        // Update local customer with Shopify ID
        await localCustomer.update({
          shopify_customer_id: String(shopifyResponse.customer.id)
        });

        shopifyCustomer = shopifyResponse.customer;
        console.log("✅ Customer created in both local DB and Shopify");
      } catch (shopifyError) {
        console.warn("⚠️ Customer created locally but failed to sync to Shopify:", shopifyError instanceof Error ? shopifyError.message : shopifyError);
      }

      return {
        local: localCustomer,
        shopify: shopifyCustomer,
        synced_to_shopify: !!shopifyCustomer
      };
    } catch (error) {
      console.error("Failed to create customer:", error);
      throw error;
    }
  }

  /**
   * Update a customer in both local database and Shopify
   */
  static async updateCustomer(id: number, customerData: Partial<CustomerInput>) {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Update local database first
      await customer.update(customerData);

      // Try to update in Shopify (optional - don't fail if this fails)
      let shopifyUpdated = false;
      const shopifyCustomerId = customer.get('shopify_customer_id');
      if (shopifyCustomerId) {
        try {
          // Validate and format phone number for Shopify
          const formattedPhone = validateAndFormatPhone(customerData.phone);
          
          // Prepare Shopify customer data
          const shopifyCustomerData: any = {
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

          // Only include phone if it's valid
          if (formattedPhone) {
            shopifyCustomerData.phone = formattedPhone;
            console.log(`📞 Using formatted phone for Shopify update: ${formattedPhone}`);
          } else if (customerData.phone) {
            console.warn(`⚠️ Skipping invalid phone number for Shopify update: ${customerData.phone}`);
          }

          await shopifyApiService("PUT", `customers/${shopifyCustomerId}.json`, {
            customer: shopifyCustomerData
          });
          shopifyUpdated = true;
          console.log("✅ Customer updated in both local DB and Shopify");
        } catch (shopifyError) {
          console.warn("⚠️ Customer updated locally but failed to sync to Shopify:", shopifyError instanceof Error ? shopifyError.message : shopifyError);
        }
      } else {
        console.log("ℹ️ Customer updated locally (no Shopify ID to sync)");
      }

      return {
        local: customer,
        synced_to_shopify: shopifyUpdated
      };
    } catch (error) {
      console.error("Failed to update customer:", error);
      throw error;
    }
  }

  /**
   * Delete a customer from both local database and Shopify
   */
  static async deleteCustomer(id: number) {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Try to delete from Shopify first (optional - don't fail if this fails)
      let shopifyDeleted = false;
      const shopifyCustomerId = customer.get('shopify_customer_id');
      if (shopifyCustomerId) {
        try {
          await shopifyApiService("DELETE", `customers/${shopifyCustomerId}.json`);
          shopifyDeleted = true;
          console.log("✅ Customer deleted from both local DB and Shopify");
        } catch (shopifyError) {
          console.warn("⚠️ Customer will be deleted locally but failed to delete from Shopify:", shopifyError instanceof Error ? shopifyError.message : shopifyError);
        }
      } else {
        console.log("ℹ️ Customer deleted locally (no Shopify ID to sync)");
      }

      // Delete from local database
      await customer.destroy();

      return {
        deleted: true,
        synced_to_shopify: shopifyDeleted
      };
    } catch (error) {
      console.error("Failed to delete customer:", error);
      throw error;
    }
  }

  /**
   * Get all customers with pagination
   */
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
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      throw error;
    }
  }

  /**
   * Get a single customer by ID
   */
  static async getCustomerById(id: number) {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error("Customer not found");
      }
      return customer;
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      throw error;
    }
  }

  /**
   * Sync customers from Shopify to local database
   */
  static async syncCustomersFromShopify() {
    try {
      // Get customers from Shopify
      const response = await shopifyApiService<ShopifyCustomersResponse>("GET", "customers.json");
      const shopifyCustomers = response.customers;

      // Update or create each customer in local database
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
    } catch (error) {
      console.error("Failed to sync customers:", error);
      throw error;
    }
  }

  /**
   * Search customers by email or name
   */
  static async searchCustomers(query: string, page = 1, limit = 10) {
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
    } catch (error) {
      console.error("Failed to search customers:", error);
      throw error;
    }
  }
} 
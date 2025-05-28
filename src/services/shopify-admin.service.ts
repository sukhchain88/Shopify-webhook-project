import { shopifyApiService } from "./shopify.service.js";
import { ShopifyOrderResponse } from "../types/shopifyInterface.js";

interface ShopifyCustomerPayload {
  customer: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    verified_email?: boolean;
    addresses?: Array<{
      address1?: string;
      city?: string;
      province?: string;
      phone?: string;
      zip?: string;
      last_name?: string;
      first_name?: string;
      country?: string;
    }>;
  };
}

interface ShopifyCustomerResponse {
  customer: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    verified_email: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface ShopifyOrderPayload {
  order: {
    line_items: Array<{
      title: string;
      price: string;
      quantity: number;
      sku?: string;
    }>;
    customer?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    billing_address?: {
      first_name?: string;
      last_name?: string;
      address1?: string;
      city?: string;
      province?: string;
      country?: string;
      zip?: string;
      phone?: string;
    };
    shipping_address?: {
      first_name?: string;
      last_name?: string;
      address1?: string;
      city?: string;
      province?: string;
      country?: string;
      zip?: string;
      phone?: string;
    };
    financial_status?: string;
    fulfillment_status?: string;
    send_receipt?: boolean;
    send_fulfillment_receipt?: boolean;
    note?: string;
    tags?: string;
  };
}

export class ShopifyAdminService {
  /**
   * Create a new customer in Shopify admin store
   */
  static async createCustomer(customerData: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    address?: {
      address1?: string;
      city?: string;
      province?: string;
      country?: string;
      zip?: string;
    };
  }): Promise<ShopifyCustomerResponse> {
    const shopifyPayload: ShopifyCustomerPayload = {
      customer: {
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone,
        verified_email: true,
        addresses: customerData.address ? [
          {
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            address1: customerData.address.address1,
            city: customerData.address.city,
            province: customerData.address.province,
            country: customerData.address.country,
            zip: customerData.address.zip,
            phone: customerData.phone,
          }
        ] : []
      }
    };

    try {
      const response = await shopifyApiService<ShopifyCustomerResponse>(
        "POST",
        "customers.json",
        shopifyPayload
      );

      console.log(`✅ Customer created in Shopify: ${response.customer.email} (ID: ${response.customer.id})`);
      return response;
    } catch (error) {
      console.error("❌ Failed to create customer in Shopify:", error);
      throw error;
    }
  }

  /**
   * Update an existing customer in Shopify admin store
   */
  static async updateCustomer(customerId: string, customerData: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }>): Promise<ShopifyCustomerResponse> {
    const shopifyPayload = {
      customer: customerData
    };

    try {
      const response = await shopifyApiService<ShopifyCustomerResponse>(
        "PUT",
        `customers/${customerId}.json`,
        shopifyPayload
      );

      console.log(`✅ Customer updated in Shopify: ${response.customer.email} (ID: ${response.customer.id})`);
      return response;
    } catch (error) {
      console.error("❌ Failed to update customer in Shopify:", error);
      throw error;
    }
  }

  /**
   * Get a customer from Shopify admin store
   */
  static async getCustomer(customerId: string): Promise<ShopifyCustomerResponse> {
    try {
      const response = await shopifyApiService<ShopifyCustomerResponse>(
        "GET",
        `customers/${customerId}.json`
      );

      console.log(`✅ Customer retrieved from Shopify: ${response.customer.email}`);
      return response;
    } catch (error) {
      console.error("❌ Failed to get customer from Shopify:", error);
      throw error;
    }
  }

  /**
   * Create a new order in Shopify admin store
   */
  static async createOrder(orderData: {
    line_items: Array<{
      title: string;
      price: string;
      quantity: number;
      sku?: string;
    }>;
    customer?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    billing_address?: any;
    shipping_address?: any;
    financial_status?: string;
    note?: string;
    tags?: string;
  }): Promise<ShopifyOrderResponse> {
    const shopifyPayload: ShopifyOrderPayload = {
      order: {
        line_items: orderData.line_items,
        customer: orderData.customer,
        billing_address: orderData.billing_address,
        shipping_address: orderData.shipping_address,
        financial_status: orderData.financial_status || "pending",
        send_receipt: false,
        send_fulfillment_receipt: false,
        note: orderData.note,
        tags: orderData.tags,
      }
    };

    try {
      const response = await shopifyApiService<ShopifyOrderResponse>(
        "POST",
        "orders.json",
        shopifyPayload
      );

      console.log(`✅ Order created in Shopify: #${response.order.order_number} (ID: ${response.order.id})`);
      return response;
    } catch (error) {
      console.error("❌ Failed to create order in Shopify:", error);
      throw error;
    }
  }

  /**
   * Update an existing order in Shopify admin store
   */
  static async updateOrder(orderId: string, orderData: Partial<{
    note: string;
    tags: string;
    financial_status: string;
  }>): Promise<ShopifyOrderResponse> {
    const shopifyPayload = {
      order: orderData
    };

    try {
      const response = await shopifyApiService<ShopifyOrderResponse>(
        "PUT",
        `orders/${orderId}.json`,
        shopifyPayload
      );

      console.log(`✅ Order updated in Shopify: #${response.order.order_number} (ID: ${response.order.id})`);
      return response;
    } catch (error) {
      console.error("❌ Failed to update order in Shopify:", error);
      throw error;
    }
  }

  /**
   * Get an order from Shopify admin store
   */
  static async getOrder(orderId: string): Promise<ShopifyOrderResponse> {
    try {
      const response = await shopifyApiService<ShopifyOrderResponse>(
        "GET",
        `orders/${orderId}.json`
      );

      console.log(`✅ Order retrieved from Shopify: #${response.order.order_number}`);
      return response;
    } catch (error) {
      console.error("❌ Failed to get order from Shopify:", error);
      throw error;
    }
  }

  /**
   * Cancel an order in Shopify admin store
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<ShopifyOrderResponse> {
    const shopifyPayload = {
      reason: reason || "customer"
    };

    try {
      const response = await shopifyApiService<ShopifyOrderResponse>(
        "POST",
        `orders/${orderId}/cancel.json`,
        shopifyPayload
      );

      console.log(`✅ Order cancelled in Shopify: #${response.order.order_number} (ID: ${response.order.id})`);
      return response;
    } catch (error) {
      console.error("❌ Failed to cancel order in Shopify:", error);
      throw error;
    }
  }

  /**
   * Get all orders from Shopify admin store
   */
  static async getAllOrders(limit: number = 50, status: string = "any"): Promise<{ orders: any[] }> {
    try {
      const response = await shopifyApiService<{ orders: any[] }>(
        "GET",
        `orders.json?limit=${limit}&status=${status}`
      );

      console.log(`✅ Retrieved ${response.orders.length} orders from Shopify`);
      return response;
    } catch (error) {
      console.error("❌ Failed to get orders from Shopify:", error);
      throw error;
    }
  }

  /**
   * Get all customers from Shopify admin store
   */
  static async getAllCustomers(limit: number = 50): Promise<{ customers: any[] }> {
    try {
      const response = await shopifyApiService<{ customers: any[] }>(
        "GET",
        `customers.json?limit=${limit}`
      );

      console.log(`✅ Retrieved ${response.customers.length} customers from Shopify`);
      return response;
    } catch (error) {
      console.error("❌ Failed to get customers from Shopify:", error);
      throw error;
    }
  }

  /**
   * Sync local data to Shopify admin store
   */
  static async syncDataToShopify(data: {
    products?: any[];
    customers?: any[];
    orders?: any[];
  }): Promise<{
    products: any[];
    customers: any[];
    orders: any[];
  }> {
    const results = {
      products: [] as any[],
      customers: [] as any[],
      orders: [] as any[]
    };

    try {
      // Sync products
      if (data.products && data.products.length > 0) {
        console.log(`🔄 Syncing ${data.products.length} products to Shopify...`);
        for (const product of data.products) {
          try {
            const result = await this.createProductInShopify(product);
            results.products.push(result);
          } catch (error) {
            console.error(`❌ Failed to sync product: ${product.title}`, error);
          }
        }
      }

      // Sync customers
      if (data.customers && data.customers.length > 0) {
        console.log(`🔄 Syncing ${data.customers.length} customers to Shopify...`);
        for (const customer of data.customers) {
          try {
            const result = await this.createCustomer(customer);
            results.customers.push(result);
          } catch (error) {
            console.error(`❌ Failed to sync customer: ${customer.email}`, error);
          }
        }
      }

      // Sync orders
      if (data.orders && data.orders.length > 0) {
        console.log(`🔄 Syncing ${data.orders.length} orders to Shopify...`);
        for (const order of data.orders) {
          try {
            const result = await this.createOrder(order);
            results.orders.push(result);
          } catch (error) {
            console.error(`❌ Failed to sync order: ${order.order_number}`, error);
          }
        }
      }

      console.log(`✅ Sync completed: ${results.products.length} products, ${results.customers.length} customers, ${results.orders.length} orders`);
      return results;

    } catch (error) {
      console.error("❌ Failed to sync data to Shopify:", error);
      throw error;
    }
  }

  /**
   * Create a product in Shopify (helper method)
   */
  private static async createProductInShopify(productData: any): Promise<any> {
    const shopifyPayload = {
      product: {
        title: productData.title,
        body_html: productData.description || "",
        vendor: productData.metadata?.vendor || "",
        product_type: productData.metadata?.product_type || "",
        status: productData.status || "active",
        tags: productData.metadata?.tags || "",
        variants: [
          {
            price: productData.price?.toString() || "0.00",
            inventory_quantity: 100,
          }
        ]
      }
    };

    return await shopifyApiService("POST", "products.json", shopifyPayload);
  }
} 
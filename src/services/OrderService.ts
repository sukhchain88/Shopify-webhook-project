import { Order } from "../models/Order.js";
import { Customer } from "../models/Customer.js";
import { shopifyApiService } from "./ShopifyService.js";
import { ShopifyOrderResponse } from "../types/shopifyInterface.js";
import { OrderInput } from "../validators/order.validator.js";
import { Logger } from "../utils/logger.js";
import { literal } from "sequelize";

export class OrderService {
  private static readonly CUSTOMER_INCLUDE = {
    model: Customer,
    attributes: ["first_name", "last_name", "email"],
  };

  /**
   * Create an order in both local database and Shopify
   */
  static async createOrder(orderData: OrderInput) {
    // First create in local database
    const localOrder = await this.createLocalOrder(orderData);

    // Then create in Shopify
    const shopifyOrder = await this.createShopifyOrder(orderData);

    // Update local order with Shopify ID
    if (shopifyOrder?.order?.id) {
      await this.updateLocalOrderWithShopifyId(localOrder, shopifyOrder.order.id);
    }

    return {
      local: localOrder,
      shopify: shopifyOrder?.order,
    };
  }

  /**
   * Get all orders with customer information and sorting options
   */
  static async getAllOrders(options: {
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  } = {}) {
    const {
      sortOrder = 'DESC',
      limit,
      offset
    } = options;

    // Only allow sorting by ID
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'DESC';

    const queryOptions: any = {
      include: [this.CUSTOMER_INCLUDE],
      order: [['id', validSortOrder]],
    };

    // Add pagination if provided
    if (limit !== undefined) {
      queryOptions.limit = limit;
    }
    if (offset !== undefined) {
      queryOptions.offset = offset;
    }

    const ordersResult = await Order.findAll(queryOptions);
    
    // Convert to plain objects for consistent response format
    const orders = ordersResult.map(order => {
      const orderData = order.toJSON();
      return orderData;
    });
    
    Logger.table("Orders Table Data", orders);
    
    return {
      orders,
      sorting: {
        sortBy: 'id',
        sortOrder: validSortOrder
      }
    };
  }

  /**
   * Get a single order by ID with customer information
   */
  static async getOrderById(id: string | number) {
    const order = await Order.findByPk(id, {
      include: [this.CUSTOMER_INCLUDE],
    });

    if (!order) {
      Logger.warn(`Order not found with ID: ${id}`);
    } else {
      Logger.debug(`Retrieved order`, order.toJSON());
    }

    return order;
  }

  /**
   * Update an order by ID
   */
  static async updateOrder(id: string | number, orderData: Partial<OrderInput>) {
    const order = await Order.findByPk(id);
    if (!order) {
      Logger.error(`Order not found with ID: ${id}`);
      throw new Error("Order not found");
    }

    const updatedOrder = await order.update(orderData);
    Logger.success("Order updated", updatedOrder.toJSON());
    return updatedOrder;
  }

  /**
   * Delete an order by ID from both local database and Shopify
   */
  static async deleteOrder(id: string | number) {
    const order = await Order.findByPk(id);
    if (!order) {
      Logger.error(`Order not found with ID: ${id}`);
      throw new Error("Order not found");
    }

    const orderData = order.toJSON();
    let shopifyDeleted = false;

    // Try to delete from Shopify first if it has a Shopify order ID
    if (orderData.shopify_order_id && !orderData.shopify_order_id.startsWith('local-')) {
      try {
        Logger.info(`Attempting to delete order from Shopify: ${orderData.shopify_order_id}`);
        
        // Note: Shopify doesn't allow direct order deletion via API
        // Instead, we'll cancel the order which is the closest equivalent
        await shopifyApiService("POST", `orders/${orderData.shopify_order_id}/cancel.json`, {
          reason: "other",
          email: true, // Send cancellation email
          refund: false // Don't automatically refund
        });
        
        shopifyDeleted = true;
        Logger.success(`Order cancelled in Shopify: ${orderData.shopify_order_id}`);
      } catch (shopifyError) {
        Logger.warn(`Failed to cancel order in Shopify (continuing with local deletion): ${shopifyError instanceof Error ? shopifyError.message : shopifyError}`);
        console.warn("⚠️ Order will be deleted locally but failed to cancel in Shopify:", shopifyError instanceof Error ? shopifyError.message : shopifyError);
      }
    } else if (orderData.shopify_order_id?.startsWith('local-')) {
      Logger.info("Order is local-only (no Shopify sync needed)");
    } else {
      Logger.info("Order has no Shopify ID (no Shopify sync needed)");
    }

    // Delete from local database
    await order.destroy();
    Logger.success(`Order deleted from local database`, { id, shopify_order_id: orderData.shopify_order_id });
    
    return {
      deleted: true,
      local_deleted: true,
      shopify_cancelled: shopifyDeleted,
      shopify_order_id: orderData.shopify_order_id,
      order_data: orderData
    };
  }

  /**
   * Create order in local database
   */
  private static async createLocalOrder(orderData: OrderInput) {
    Logger.info("Creating order in local database", orderData);
    const order = await Order.create({
      shop_domain: orderData.shop_domain,
      order_number: orderData.order_number,
      customer_id: orderData.customer_id,
      total_price: orderData.total_price,
      currency: orderData.currency,
      status: orderData.status,
      shopify_order_id: orderData.shopify_order_id || `local-${Date.now()}`,
    });
    Logger.success("Order created in local database", order.toJSON());
    return order;
  }

  /**
   * Create order in Shopify
   */
  private static async createShopifyOrder(orderData: OrderInput) {
    Logger.info("Creating order in Shopify...");
    const shopifyOrderPayload = {
      order: {
        line_items: orderData.line_items.map((item) => ({
          ...item,
          price: String(item.price),
        })),
        customer: orderData.customer,
        financial_status: orderData.status,
        currency: orderData.currency,
        total_price: String(orderData.total_price),
      },
    };

    const shopifyOrder = await shopifyApiService<ShopifyOrderResponse>(
      "POST",
      "orders.json",
      shopifyOrderPayload
    );
    Logger.success("Order created in Shopify", shopifyOrder);
    return shopifyOrder;
  }

  /**
   * Update local order with Shopify ID
   */
  private static async updateLocalOrderWithShopifyId(order: any, shopifyId: number) {
    await order.update({
      shopify_order_id: String(shopifyId),
    });
    Logger.success("Updated local order with Shopify ID", { shopifyId });
  }
} 
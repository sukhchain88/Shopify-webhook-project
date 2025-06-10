"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const Order_js_1 = require("../models/Order.js");
const Customer_js_1 = require("../models/Customer.js");
const ShopifyService_js_1 = require("./ShopifyService.js");
const logger_js_1 = require("../utils/logger.js");
class OrderService {
    static async createOrder(orderData) {
        const localOrder = await this.createLocalOrder(orderData);
        const shopifyOrder = await this.createShopifyOrder(orderData);
        if (shopifyOrder?.order?.id) {
            await this.updateLocalOrderWithShopifyId(localOrder, shopifyOrder.order.id);
        }
        return {
            local: localOrder,
            shopify: shopifyOrder?.order,
        };
    }
    static async getAllOrders(options = {}) {
        const { sortOrder = 'DESC', limit, offset } = options;
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'DESC';
        const queryOptions = {
            include: [this.CUSTOMER_INCLUDE],
            order: [['id', validSortOrder]],
        };
        if (limit !== undefined) {
            queryOptions.limit = limit;
        }
        if (offset !== undefined) {
            queryOptions.offset = offset;
        }
        const ordersResult = await Order_js_1.Order.findAll(queryOptions);
        const orders = ordersResult.map((order) => {
            const orderData = order.toJSON();
            return orderData;
        });
        logger_js_1.Logger.table("Orders Table Data", orders);
        return {
            orders,
            sorting: {
                sortBy: 'id',
                sortOrder: validSortOrder
            }
        };
    }
    static async getOrderById(id) {
        const order = await Order_js_1.Order.findByPk(id, {
            include: [this.CUSTOMER_INCLUDE],
        });
        if (!order) {
            logger_js_1.Logger.warn(`Order not found with ID: ${id}`);
        }
        else {
            logger_js_1.Logger.debug(`Retrieved order`, order.toJSON());
        }
        return order;
    }
    static async updateOrder(id, orderData) {
        const order = await Order_js_1.Order.findByPk(id);
        if (!order) {
            logger_js_1.Logger.error(`Order not found with ID: ${id}`);
            throw new Error("Order not found");
        }
        const updatedOrder = await order.update(orderData);
        logger_js_1.Logger.success("Order updated", updatedOrder.toJSON());
        return updatedOrder;
    }
    static async deleteOrder(id) {
        const order = await Order_js_1.Order.findByPk(id);
        if (!order) {
            logger_js_1.Logger.error(`Order not found with ID: ${id}`);
            throw new Error("Order not found");
        }
        const orderData = order.toJSON();
        let shopifyDeleted = false;
        if (orderData.shopify_order_id && !orderData.shopify_order_id.startsWith('local-')) {
            try {
                logger_js_1.Logger.info(`Attempting to delete order from Shopify: ${orderData.shopify_order_id}`);
                await (0, ShopifyService_js_1.shopifyApiService)("POST", `orders/${orderData.shopify_order_id}/cancel.json`, {
                    reason: "other",
                    email: true,
                    refund: false
                });
                shopifyDeleted = true;
                logger_js_1.Logger.success(`Order cancelled in Shopify: ${orderData.shopify_order_id}`);
            }
            catch (shopifyError) {
                logger_js_1.Logger.warn(`Failed to cancel order in Shopify (continuing with local deletion): ${shopifyError instanceof Error ? shopifyError.message : shopifyError}`);
                console.warn("⚠️ Order will be deleted locally but failed to cancel in Shopify:", shopifyError instanceof Error ? shopifyError.message : shopifyError);
            }
        }
        else if (orderData.shopify_order_id?.startsWith('local-')) {
            logger_js_1.Logger.info("Order is local-only (no Shopify sync needed)");
        }
        else {
            logger_js_1.Logger.info("Order has no Shopify ID (no Shopify sync needed)");
        }
        await order.destroy();
        logger_js_1.Logger.success(`Order deleted from local database`, { id, shopify_order_id: orderData.shopify_order_id });
        return {
            deleted: true,
            local_deleted: true,
            shopify_cancelled: shopifyDeleted,
            shopify_order_id: orderData.shopify_order_id,
            order_data: orderData
        };
    }
    static async createLocalOrder(orderData) {
        logger_js_1.Logger.info("Creating order in local database", orderData);
        const order = await Order_js_1.Order.create({
            shop_domain: orderData.shop_domain,
            order_number: orderData.order_number,
            customer_id: orderData.customer_id,
            total_price: orderData.total_price,
            currency: orderData.currency,
            status: orderData.status,
            shopify_order_id: orderData.shopify_order_id || `local-${Date.now()}`,
        });
        logger_js_1.Logger.success("Order created in local database", order.toJSON());
        return order;
    }
    static async createShopifyOrder(orderData) {
        logger_js_1.Logger.info("Creating order in Shopify...");
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
        const shopifyOrder = await (0, ShopifyService_js_1.shopifyApiService)("POST", "orders.json", shopifyOrderPayload);
        logger_js_1.Logger.success("Order created in Shopify", shopifyOrder);
        return shopifyOrder;
    }
    static async updateLocalOrderWithShopifyId(order, shopifyId) {
        await order.update({
            shopify_order_id: String(shopifyId),
        });
        logger_js_1.Logger.success("Updated local order with Shopify ID", { shopifyId });
    }
}
exports.OrderService = OrderService;
OrderService.CUSTOMER_INCLUDE = {
    model: Customer_js_1.Customer,
    attributes: ["first_name", "last_name", "email"],
};

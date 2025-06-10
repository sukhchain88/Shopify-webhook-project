"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.getAllOrders = exports.createOrder = void 0;
const OrderService_js_1 = require("../services/OrderService.js");
const order_validator_js_1 = require("../validators/order.validator.js");
const responseHandler_js_1 = require("../utils/responseHandler.js");
const createOrder = async (req, res) => {
    const startTime = Date.now();
    try {
        const parsed = (0, order_validator_js_1.validateOrder)(req.body);
        if (!parsed.success) {
            const formattedErrors = parsed.error.format();
            return responseHandler_js_1.ResponseHandler.error(res, {
                statusCode: 400,
                message: "Invalid order data",
                details: {
                    validation: formattedErrors,
                    receivedData: req.body
                },
                startTime,
            });
        }
        const result = await OrderService_js_1.OrderService.createOrder(parsed.data);
        return responseHandler_js_1.ResponseHandler.success(res, {
            statusCode: 201,
            message: "Order created successfully in both local database and Shopify",
            data: result,
            startTime,
        });
    }
    catch (error) {
        console.error("❌ Error creating order:", error);
        return responseHandler_js_1.ResponseHandler.error(res, {
            message: "Failed to create order",
            error,
            startTime,
        });
    }
};
exports.createOrder = createOrder;
const getAllOrders = async (req, res) => {
    const startTime = Date.now();
    try {
        const sortOrder = req.query.sortOrder?.toUpperCase();
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
        const page = req.query.page ? parseInt(req.query.page) : undefined;
        const calculatedOffset = page && limit ? (page - 1) * limit : offset;
        const result = await OrderService_js_1.OrderService.getAllOrders({
            sortOrder,
            limit,
            offset: calculatedOffset
        });
        console.log("📄 Orders Table Data:");
        console.table(result.orders);
        const responseData = {
            orders: result.orders,
            sorting: result.sorting,
            pagination: limit ? {
                limit,
                offset: calculatedOffset || 0,
                page: page || 1
            } : undefined
        };
        return responseHandler_js_1.ResponseHandler.success(res, {
            message: "Orders retrieved successfully",
            data: responseData,
            startTime,
        });
    }
    catch (error) {
        return responseHandler_js_1.ResponseHandler.error(res, {
            message: "Failed to fetch orders",
            error,
            startTime,
        });
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    const startTime = Date.now();
    try {
        const order = await OrderService_js_1.OrderService.getOrderById(req.params.id);
        if (!order) {
            return responseHandler_js_1.ResponseHandler.error(res, {
                statusCode: 404,
                message: "Order not found",
                startTime,
            });
        }
        return responseHandler_js_1.ResponseHandler.success(res, {
            message: "Order retrieved successfully",
            data: order,
            startTime,
        });
    }
    catch (error) {
        console.error("❌ Error fetching order:", error);
        return responseHandler_js_1.ResponseHandler.error(res, {
            message: "Failed to fetch order",
            error,
            startTime,
        });
    }
};
exports.getOrderById = getOrderById;
const updateOrder = async (req, res) => {
    const startTime = Date.now();
    try {
        const order = await OrderService_js_1.OrderService.updateOrder(req.params.id, req.body);
        console.log("✅ Order updated:", order.toJSON());
        return responseHandler_js_1.ResponseHandler.success(res, {
            message: "Order updated successfully",
            data: order,
            startTime,
        });
    }
    catch (error) {
        return responseHandler_js_1.ResponseHandler.error(res, {
            message: "Failed to update order",
            error,
            startTime,
        });
    }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res) => {
    const startTime = Date.now();
    try {
        const result = await OrderService_js_1.OrderService.deleteOrder(req.params.id);
        return responseHandler_js_1.ResponseHandler.success(res, {
            message: result.shopify_cancelled
                ? "Order deleted successfully from local database and cancelled in Shopify"
                : "Order deleted successfully from local database",
            data: {
                deleted: result.deleted,
                local_deleted: result.local_deleted,
                shopify_cancelled: result.shopify_cancelled,
                shopify_order_id: result.shopify_order_id,
                note: result.shopify_cancelled
                    ? "Order was cancelled in Shopify (orders cannot be permanently deleted via API)"
                    : result.shopify_order_id
                        ? "Order deletion from local database successful, but Shopify cancellation failed"
                        : "Order was local-only, no Shopify sync needed"
            },
            startTime,
        });
    }
    catch (error) {
        return responseHandler_js_1.ResponseHandler.error(res, {
            message: "Failed to delete order",
            error,
            startTime,
        });
    }
};
exports.deleteOrder = deleteOrder;

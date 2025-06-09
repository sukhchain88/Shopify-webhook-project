// src\controllers\order.controller.ts
import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { validateOrder } from "../validators/order.validator";
import { ResponseHandler } from "../utils/responseHandler";

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // Validate order data using Zod schema
    const parsed = validateOrder(req.body);
    
    if (!parsed.success) {
      const formattedErrors = parsed.error.format();
      return ResponseHandler.error(res, {
        statusCode: 400,
        message: "Invalid order data",
        details: {
          validation: formattedErrors,
          receivedData: req.body
        },
        startTime,
      });
    }

    const result = await OrderService.createOrder(parsed.data);

    return ResponseHandler.success(res, {
      statusCode: 201,
      message: "Order created successfully in both local database and Shopify",
      data: result,
      startTime,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return ResponseHandler.error(res, {
      message: "Failed to create order",
      error,
      startTime,
    });
  }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // Extract query parameters for sorting and pagination (only sortOrder, always sort by ID)
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;

    // Calculate offset from page if provided
    const calculatedOffset = page && limit ? (page - 1) * limit : offset;

    const result = await OrderService.getAllOrders({
      sortOrder,
      limit,
      offset: calculatedOffset
    });

    console.log("📄 Orders Table Data:");
    console.table(result.orders);

    // Add sorting info to response using validated values from service
    const responseData = {
      orders: result.orders,
      sorting: result.sorting,
      pagination: limit ? {
        limit,
        offset: calculatedOffset || 0,
        page: page || 1
      } : undefined
    };

    return ResponseHandler.success(res, {
      message: "Orders retrieved successfully",
      data: responseData,
      startTime,
    });
  } catch (error) {
    return ResponseHandler.error(res, {
      message: "Failed to fetch orders",
      error,
      startTime,
    });
  }
};

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const order = await OrderService.getOrderById(req.params.id);

    if (!order) {
      return ResponseHandler.error(res, {
        statusCode: 404,
        message: "Order not found",
        startTime,
      });
    }

    return ResponseHandler.success(res, {
      message: "Order retrieved successfully",
      data: order,
      startTime,
    });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return ResponseHandler.error(res, {
      message: "Failed to fetch order",
      error,
      startTime,
    });
  }
};

// Update an order
export const updateOrder = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const order = await OrderService.updateOrder(req.params.id, req.body);
    console.log("✅ Order updated:", order.toJSON());

    return ResponseHandler.success(res, {
      message: "Order updated successfully",
      data: order,
      startTime,
    });
  } catch (error) {
    return ResponseHandler.error(res, {
      message: "Failed to update order",
      error,
      startTime,
    });
  }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const result = await OrderService.deleteOrder(req.params.id);

    return ResponseHandler.success(res, {
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
  } catch (error) {
    return ResponseHandler.error(res, {
      message: "Failed to delete order",
      error,
      startTime,
    });
  }
};

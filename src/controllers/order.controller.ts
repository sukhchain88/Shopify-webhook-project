// src\controllers\order.controller.ts
import { Request, Response } from "express";
import { Order } from "../models/order.js";
import { Customer } from "../models/customer.js";

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Customer,
          attributes: ['first_name', 'last_name', 'email']
        }
      ],
      raw: true,
      logging: console.log
    });

    console.log("📄 Orders Table Data:")      
    console.table(orders);

    return res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders
    });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return res.status(500).json({ 
      error: "Failed to fetch orders", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          attributes: ['first_name', 'last_name', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({
      message: "Order retrieved successfully",
      data: order
    });
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    return res.status(500).json({ 
      error: "Failed to fetch order", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.shop_domain || !orderData.order_number) {
      return res.status(400).json({ error: "Shop domain and order number are required" });
    }

    const order = await Order.create(orderData);
    
    console.log("✅ Order created:", order.toJSON());
    
    return res.status(201).json({
      message: "Order created successfully",
      data: order
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return res.status(500).json({ 
      error: "Failed to create order", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Update an order
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderData = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    await order.update(orderData);
    
    console.log("✅ Order updated:", order.toJSON());
    
    return res.status(200).json({
      message: "Order updated successfully",
      data: order
    });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    return res.status(500).json({ 
      error: "Failed to update order", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    await order.destroy();
    
    console.log("✅ Order deleted:", id);
    
    return res.status(200).json({
      message: "Order deleted successfully"
    });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    return res.status(500).json({ 
      error: "Failed to delete order", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
}; 
 
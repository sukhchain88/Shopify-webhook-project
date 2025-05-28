// src\routes\order.routes.ts
import express from "express";
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, } from "../controllers/order.controller.js";
const router = express.Router();
// No need to add /orders prefix as it's already in the path
// GET all orders
router.get("/", getAllOrders);
// GET a single order by ID
router.get("/:id", getOrderById);
// POST create a new order
router.post("/", createOrder);
// PUT update an order
router.put("/:id", updateOrder);
// DELETE an order
router.delete("/:id", deleteOrder);
export default router;

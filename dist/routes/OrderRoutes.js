"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src\routes\order.routes.ts
const express_1 = __importDefault(require("express"));
const OrderController_1 = require("../controllers/OrderController");
const router = express_1.default.Router();
// No need to add /orders prefix as it's already in the path
// GET all orders
router.get("/", OrderController_1.getAllOrders);
// GET a single order by ID
router.get("/:id", OrderController_1.getOrderById);
// POST create a new order
router.post("/", OrderController_1.createOrder);
// PUT update an order
router.put("/:id", OrderController_1.updateOrder);
// DELETE an order
router.delete("/:id", OrderController_1.deleteOrder);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const OrderController_1 = require("../controllers/OrderController");
const router = express_1.default.Router();
router.get("/", OrderController_1.getAllOrders);
router.get("/:id", OrderController_1.getOrderById);
router.post("/", OrderController_1.createOrder);
router.put("/:id", OrderController_1.updateOrder);
router.delete("/:id", OrderController_1.deleteOrder);
exports.default = router;

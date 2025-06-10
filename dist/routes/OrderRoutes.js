"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const OrderController_js_1 = require("../controllers/OrderController.js");
const router = express_1.default.Router();
router.get("/", OrderController_js_1.getAllOrders);
router.get("/:id", OrderController_js_1.getOrderById);
router.post("/", OrderController_js_1.createOrder);
router.put("/:id", OrderController_js_1.updateOrder);
router.delete("/:id", OrderController_js_1.deleteOrder);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src\routes\shopify.routes.ts
const express_1 = __importDefault(require("express"));
const ShopifyController_js_1 = require("../controllers/ShopifyController.js");
const router = express_1.default.Router();
// Register  - no need to add /shopify prefix as it's already in the path
router.post("/", ShopifyController_js_1.createWebhookHandler);
router.get("/", ShopifyController_js_1.listWebhooksHandler);
router.delete("/:id", ShopifyController_js_1.deleteWebhookHandler);
exports.default = router;

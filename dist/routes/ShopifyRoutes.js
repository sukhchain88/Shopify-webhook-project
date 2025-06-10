import express from "express";
import { createWebhookHandler, listWebhooksHandler, deleteWebhookHandler, } from "../controllers/ShopifyController.js";
const router = express.Router();
router.post("/", createWebhookHandler);
router.get("/", listWebhooksHandler);
router.delete("/:id", deleteWebhookHandler);
export default router;

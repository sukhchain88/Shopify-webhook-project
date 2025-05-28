import express from 'express';
import { createProduct, handleShopifyWebhook } from '../controllers/product.controller.js';
import { verifyShopifyWebhook } from '../middleware/verifyShopifyWebhook.js';
const productRoutes = express.Router();
// Create product
productRoutes.post('/', createProduct);
// Handle Shopify webhook
productRoutes.post('/webhook', express.raw({ type: 'application/json' }), verifyShopifyWebhook, handleShopifyWebhook);
export default productRoutes;

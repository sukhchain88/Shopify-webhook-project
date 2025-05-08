// src\routes\products.routes.ts
// src\routes\products.routes.js
import express from 'express';
import { createProduct, getAllProducts } from '../controllers/product.controller.js';
const router = express.Router();
// No need to add /products prefix as it's already in the path
router.post('/', (req) => {
    const body = req.body;
    console.log("body", body);
    createProduct;
});
router.get('/', getAllProducts);
export default router;

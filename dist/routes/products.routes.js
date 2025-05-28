/**
 * Product Routes
 *
 * Handles all product-related API endpoints including:
 * - GET /products - Get all products with pagination
 * - GET /products/:id - Get a specific product by ID
 * - POST /products - Create a new product
 * - PUT /products/:id - Update an existing product
 * - DELETE /products/:id - Delete a product
 *
 * @author Your Name
 */
// src\routes\products.routes.ts
// src\routes\products.routes.js
import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, } from "../controllers/product.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";
const router = express.Router();
/**
 * @route   GET /products
 * @desc    Get all products with optional pagination and filtering
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   search - Search term for product title
 * @query   status - Filter by product status (active, draft, archived)
 */
router.get("/", asyncHandler(getAllProducts));
/**
 * @route   GET /products/:id
 * @desc    Get a specific product by ID
 * @access  Public
 * @param   id - Product ID
 */
router.get("/:id", asyncHandler(getProductById));
/**
 * @route   POST /products
 * @desc    Create a new product
 * @access  Public (should be protected in production)
 * @body    title - Product title (required)
 * @body    price - Product price (required)
 * @body    description - Product description (optional)
 * @body    status - Product status (optional, default: active)
 * @body    metadata - Additional product metadata (optional)
 */
router.post("/", asyncHandler(createProduct));
/**
 * @route   PUT /products/:id
 * @desc    Update an existing product
 * @access  Public (should be protected in production)
 * @param   id - Product ID
 * @body    Any product fields to update
 */
router.put("/:id", asyncHandler(updateProduct));
/**
 * @route   DELETE /products/:id
 * @desc    Delete a product
 * @access  Public (should be protected in production)
 * @param   id - Product ID
 */
router.delete("/:id", asyncHandler(deleteProduct));
export default router;

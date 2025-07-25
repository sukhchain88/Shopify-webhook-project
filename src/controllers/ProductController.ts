/**
 * Product Controller
 * 
 * Handles all product-related business logic including:
 * - CRUD operations for products
 * - Shopify webhook processing
 * - Data validation and transformation
 * 
 * @author Your Name
 */

import { Request, Response } from "express";
import { Product } from "../models";
import { validateProduct, validateWebhook } from "../validators/product.validator";
import { ProductService } from "../services/ProductService";
import { Op } from "sequelize";
import sequelize from "../config/db";

/**
 * Create a new product
 * 
 * @route POST /products
 * @param req - Express request object
 * @param res - Express response object
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request data
    const validation = validateProduct(req.body);
    
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validation.error.issues
      });
      return;
    }

    // Create product locally using service
    const localProduct = await ProductService.createProduct(validation.data);
    
    // Automatically sync to Shopify admin store
    let shopifyProduct = null;
    let shopifyError = null;
    
    try {
      const productData = localProduct.get({ plain: true });
      shopifyProduct = await ProductService.syncProductToShopify(productData);
      console.log("✅ Product automatically synced to Shopify:", shopifyProduct.product.title);
    } catch (error) {
      console.error("⚠️ Failed to sync product to Shopify (product still created locally):", error);
      shopifyError = error instanceof Error ? error.message : "Unknown Shopify sync error";
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully" + (shopifyProduct ? " and synced to Shopify" : " (Shopify sync failed)"),
      data: {
        local: localProduct.toJSON(),
        shopify: shopifyProduct ? {
          id: shopifyProduct.product.id,
          title: shopifyProduct.product.title,
          status: shopifyProduct.product.status,
          admin_url: `https://${process.env.SHOPIFY_STORE_URL}/admin/products/${shopifyProduct.product.id}`
        } : null,
        shopify_error: shopifyError
      }
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create product",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Get all products with pagination and filtering
 * 
 * @route GET /products
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};
    
    if (search) {
      // Use database-agnostic case-insensitive search
      whereClause.title = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('title')),
        Op.like,
        `%${search.toLowerCase()}%`
      );
    }
    
    if (status && ['active', 'draft', 'archived'].includes(status)) {
      whereClause.status = status;
    }

    // Get products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['id', 'DESC']] // Most recent first
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log(`📄 Retrieved ${products.length} products (page ${page}/${totalPages})`);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error("❌ Error getting products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve products",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Get a single product by ID
 * 
 * @route GET /products/:id
 * @param req - Express request object
 * @param res - Express response object
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        error: "Invalid product ID",
        message: "Product ID must be a valid number"
      });
      return;
    }

    // Find product by ID
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
        message: `Product with ID ${id} does not exist`
      });
      return;
    }

    console.log(`📄 Retrieved product: ${product.getDataValue('title')} (ID: ${id})`);

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product.toJSON()
    });
  } catch (error) {
    console.error("❌ Error getting product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve product",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Update an existing product
 * 
 * @route PUT /products/:id
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        error: "Invalid product ID",
        message: "Product ID must be a valid number"
      });
      return;
    }

    // Find product by ID
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
        message: `Product with ID ${id} does not exist`
      });
      return;
    }

    // Validate update data (partial validation)
    const allowedFields = ['title', 'description', 'price', 'status', 'metadata', 'shopify_product_id'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: "No valid fields to update",
        message: "Request body must contain at least one valid field to update"
      });
      return;
    }

    // Update product locally
    await product.update(updateData);

    console.log(`✅ Product updated locally: ${product.getDataValue('title')} (ID: ${id})`);

    // Automatically sync to Shopify admin store if product has Shopify ID
    let shopifyProduct = null;
    let shopifyError = null;
    
    const shopifyProductId = product.getDataValue('shopify_product_id');
    if (shopifyProductId) {
      try {
        const productData = product.get({ plain: true });
        shopifyProduct = await ProductService.updateProductInShopify(shopifyProductId, {
          title: productData.title,
          description: productData.description,
          price: parseFloat(productData.price),
          status: productData.status,
          metadata: productData.metadata
        });
        console.log("✅ Product automatically synced to Shopify:", shopifyProduct.product.title);
      } catch (error) {
        console.error("⚠️ Failed to sync product update to Shopify (local update successful):", error);
        shopifyError = error instanceof Error ? error.message : "Unknown Shopify sync error";
      }
    } else {
      console.log("ℹ️ Product not synced to Shopify (no Shopify product ID)");
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully" + (shopifyProduct ? " and synced to Shopify" : shopifyProductId ? " (Shopify sync failed)" : ""),
      data: {
        local: product.toJSON(),
        shopify: shopifyProduct ? {
          id: shopifyProduct.product.id,
          title: shopifyProduct.product.title,
          status: shopifyProduct.product.status,
          admin_url: `https://${process.env.SHOPIFY_STORE_URL}/admin/products/${shopifyProduct.product.id}`
        } : null,
        shopify_error: shopifyError
      }
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update product",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Delete a product
 * 
 * @route DELETE /products/:id
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        error: "Invalid product ID",
        message: "Product ID must be a valid number"
      });
      return;
    }

    // Find product by ID
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product not found",
        message: `Product with ID ${id} does not exist`
      });
      return;
    }

    const productTitle = product.getDataValue('title');
    const shopifyProductId = product.getDataValue('shopify_product_id');

    // Automatically delete from Shopify admin store if product has Shopify ID
    let shopifyDeleted = false;
    let shopifyError = null;
    
    if (shopifyProductId) {
      try {
        await ProductService.deleteProductFromShopify(shopifyProductId);
        shopifyDeleted = true;
        console.log(`✅ Product automatically deleted from Shopify: ${productTitle}`);
      } catch (error) {
        console.error("⚠️ Failed to delete product from Shopify (will still delete locally):", error);
        shopifyError = error instanceof Error ? error.message : "Unknown Shopify deletion error";
      }
    }

    // Delete product locally
    await product.destroy();

    console.log(`🗑️ Product deleted locally: ${productTitle} (ID: ${id})`);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully" + (shopifyDeleted ? " from both local and Shopify" : shopifyProductId ? " locally (Shopify deletion failed)" : " locally"),
      data: {
        id: Number(id),
        title: productTitle,
        shopify_deleted: shopifyDeleted,
        shopify_error: shopifyError
      }
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete product",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Handle Shopify webhook for product events
 * 
 * @route POST /products/webhook
 * @param req - Express request object
 * @param res - Express response object
 */
export const handleShopifyWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const topic = req.headers["x-shopify-topic"] as string;

    // Validate webhook topic
    if (!topic?.startsWith("products/")) {
      res.status(400).json({
        success: false,
        error: "Invalid webhook topic",
        message: "Webhook topic must be a product-related event"
      });
      return;
    }

    // Validate webhook payload
    const validation = validateWebhook(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: "Webhook validation failed",
        details: validation.error.issues
      });
      return;
    }

    // Process webhook using service
    const product = await ProductService.handleWebhook(validation.data);

    console.log(`🔔 Webhook processed: ${topic} for product ${validation.data.title}`);

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      data: product.toJSON(),
      webhook: {
        topic,
        productId: validation.data.id
      }
    });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process webhook",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

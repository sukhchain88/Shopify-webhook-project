"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllProductsService = exports.ProductService = void 0;
// src\services\product.service.ts
const Product_1 = require("../models/Product");
const ShopifyService_1 = require("./ShopifyService");
const shopifyFormatter_1 = require("../utils/shopifyFormatter");
class ProductService {
    static async createProduct(data) {
        return await Product_1.Product.create(data);
    }
    static async handleWebhook(webhookData) {
        const productData = (0, shopifyFormatter_1.formatShopifyProduct)(webhookData);
        return await Product_1.Product.create(productData);
    }
    /**
     * Create a new product in Shopify admin store
     */
    static async createProductInShopify(productData) {
        const shopifyPayload = {
            product: {
                title: productData.title,
                body_html: productData.description || "",
                vendor: productData.metadata?.vendor || "",
                product_type: productData.metadata?.product_type || "",
                status: productData.status,
                tags: productData.metadata?.tags || "",
                variants: [
                    {
                        price: productData.price.toString(),
                        inventory_quantity: 100, // Default inventory
                    }
                ]
            }
        };
        try {
            const response = await (0, ShopifyService_1.shopifyApiService)("POST", "products.json", shopifyPayload);
            console.log(`✅ Product created in Shopify: ${response.product.title} (ID: ${response.product.id})`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to create product in Shopify:", error);
            throw error;
        }
    }
    /**
     * Update an existing product in Shopify admin store
     */
    static async updateProductInShopify(shopifyProductId, productData) {
        const shopifyPayload = {
            product: {}
        };
        if (productData.title)
            shopifyPayload.product.title = productData.title;
        if (productData.description !== undefined)
            shopifyPayload.product.body_html = productData.description || "";
        if (productData.status)
            shopifyPayload.product.status = productData.status;
        if (productData.metadata?.vendor)
            shopifyPayload.product.vendor = productData.metadata.vendor;
        if (productData.metadata?.product_type)
            shopifyPayload.product.product_type = productData.metadata.product_type;
        if (productData.metadata?.tags)
            shopifyPayload.product.tags = productData.metadata.tags;
        try {
            const response = await (0, ShopifyService_1.shopifyApiService)("PUT", `products/${shopifyProductId}.json`, shopifyPayload);
            console.log(`✅ Product updated in Shopify: ${response.product.title} (ID: ${response.product.id})`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to update product in Shopify:", error);
            throw error;
        }
    }
    /**
     * Get a product from Shopify admin store
     */
    static async getProductFromShopify(shopifyProductId) {
        try {
            const response = await (0, ShopifyService_1.shopifyApiService)("GET", `products/${shopifyProductId}.json`);
            console.log(`✅ Product retrieved from Shopify: ${response.product.title}`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to get product from Shopify:", error);
            throw error;
        }
    }
    /**
     * Delete a product from Shopify admin store
     */
    static async deleteProductFromShopify(shopifyProductId) {
        try {
            await (0, ShopifyService_1.shopifyApiService)("DELETE", `products/${shopifyProductId}.json`);
            console.log(`✅ Product deleted from Shopify (ID: ${shopifyProductId})`);
        }
        catch (error) {
            console.error("❌ Failed to delete product from Shopify:", error);
            throw error;
        }
    }
    /**
     * Sync local product to Shopify admin store
     */
    static async syncProductToShopify(localProduct) {
        const productData = {
            title: localProduct.title,
            description: localProduct.description,
            price: parseFloat(localProduct.price),
            status: localProduct.status,
            metadata: {
                vendor: localProduct.metadata?.vendor || null,
                product_type: localProduct.metadata?.product_type || null,
                tags: localProduct.metadata?.tags || null,
            }
        };
        if (localProduct.shopify_product_id) {
            // Update existing product
            return await this.updateProductInShopify(localProduct.shopify_product_id, productData);
        }
        else {
            // Create new product
            const response = await this.createProductInShopify(productData);
            // Update local product with Shopify ID
            await Product_1.Product.update({ shopify_product_id: response.product.id.toString() }, { where: { id: localProduct.id } });
            return response;
        }
    }
}
exports.ProductService = ProductService;
const fetchAllProductsService = async () => {
    return await Product_1.Product.findAll({ raw: true });
};
exports.fetchAllProductsService = fetchAllProductsService;

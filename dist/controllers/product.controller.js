import { createProductService, fetchAllProductsService } from "../services/product.service.js";
import { validateProductInput } from "../validators/product.validator.js";
export const createProduct = async (req, res) => {
    try {
        const parsed = validateProductInput(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid product data", details: parsed.error.format() });
        }
        const shopifyProduct = await createProductService(parsed.data.product);
        res.status(201).json(shopifyProduct);
    }
    catch (error) {
        console.error("❌ Create product error:", error?.response?.data || error.message || error);
        res.status(500).json({
            error: "Failed to create product",
            details: error?.response?.data || error.message || String(error),
        });
    }
};
export const getAllProducts = async (_req, res) => {
    try {
        const products = await fetchAllProductsService();
        res.status(200).json({ message: "Products retrieved successfully", data: products });
    }
    catch (err) {
        console.error("❌ Error fetching products:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

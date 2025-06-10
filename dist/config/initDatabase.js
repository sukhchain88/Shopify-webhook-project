"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initDatabase = void 0;
const db_1 = __importDefault(require("./db"));
const Product_1 = require("../models/Product");
const Customer_1 = require("../models/Customer");
const initDatabase = async () => {
    try {
        console.log("🔧 Initializing database...");
        await db_1.default.authenticate();
        console.log("✅ Database connection established");
        await db_1.default.sync({
            force: false,
            alter: process.env.NODE_ENV === 'development'
        });
        console.log("✅ Database tables synchronized");
        const tables = [
            "products",
            "customers",
            "orders",
            "order_items",
            "webhooks",
            "users",
        ];
        console.log("📋 Verified tables:", tables.join(", "));
        if (process.env.NODE_ENV === 'development' && process.env.SEED_DATABASE === 'true') {
            await seedDevelopmentData();
        }
    }
    catch (error) {
        console.error("❌ Database initialization failed:", error);
        if (process.env.NODE_ENV === "development") {
            console.log("⚠️ Continuing in development mode without database");
        }
        else {
            throw error;
        }
    }
};
exports.initDatabase = initDatabase;
async function seedDevelopmentData() {
    try {
        console.log("🌱 Seeding development data...");
        const productCount = await Product_1.Product.count();
        if (productCount > 0) {
            console.log("📋 Development data already exists, skipping seed");
            return;
        }
        const sampleProducts = [
            {
                title: "Sample Product 1",
                description: "This is a sample product for development",
                price: 29.99,
                status: "active",
                shopify_product_id: "sample_1",
                metadata: { category: "electronics", featured: true }
            },
            {
                title: "Sample Product 2",
                description: "Another sample product",
                price: 49.99,
                status: "active",
                shopify_product_id: "sample_2",
                metadata: { category: "clothing", featured: false }
            }
        ];
        await Product_1.Product.bulkCreate(sampleProducts);
        console.log("✅ Sample products created");
        const sampleCustomer = await Customer_1.Customer.create({
            shop_domain: "dev-store.myshopify.com",
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            shopify_customer_id: "sample_customer_1",
            address: "123 Main St",
            city: "Anytown",
            province: "CA",
            country: "United States",
            zip: "12345"
        });
        console.log("✅ Sample customer created");
    }
    catch (error) {
        console.error("❌ Failed to seed development data:", error);
    }
}
const closeDatabase = async () => {
    try {
        await db_1.default.close();
        console.log("✅ Database connection closed");
    }
    catch (error) {
        console.error("❌ Error closing database:", error);
    }
};
exports.closeDatabase = closeDatabase;
exports.default = exports.initDatabase;

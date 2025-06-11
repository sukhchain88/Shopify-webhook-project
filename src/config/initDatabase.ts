import sequelize from "./db";
import { Product, Customer, Order, OrderItem, Webhook, Users } from "../models";

/**
 * Initialize database and create all tables
 */
export const initDatabase = async (): Promise<void> => {
  try {
    console.log("🔧 Initializing database...");
    
    // Test connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established");
    
    // Sync all models (create tables if they don't exist)
    // In production, consider using migrations instead
    await sequelize.sync({ 
      force: false, 
      alter: process.env.NODE_ENV === 'development' 
    });
    console.log("✅ Database tables synchronized");
    
    // Log which tables were created/verified
    const tables = [
      "products",
      "customers",
      "orders",
      "order_items",
      "webhooks",
      "users",
    ];
    
    console.log("📋 Verified tables:", tables.join(", "));
    
    // Optionally seed data in development
    if (process.env.NODE_ENV === 'development' && process.env.SEED_DATABASE === 'true') {
      await seedDevelopmentData();
    }
    
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    
    // In development, continue without database
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Continuing in development mode without database");
    } else {
      // In production, this is a critical error
      throw error;
    }
  }
};

/**
 * Seed development data (optional)
 */
async function seedDevelopmentData(): Promise<void> {
  try {
    console.log("🌱 Seeding development data...");
    
    // Check if data already exists
    const productCount = await Product.count();
    if (productCount > 0) {
      console.log("📋 Development data already exists, skipping seed");
      return;
    }
    
    // Create sample products
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
    
    await Product.bulkCreate(sampleProducts);
    console.log("✅ Sample products created");
    
    // Create sample customer
    const sampleCustomer = await Customer.create({
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
    
  } catch (error) {
    console.error("❌ Failed to seed development data:", error);
    // Don't throw error for seeding failure
  }
}

/**
 * Close database connection gracefully
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error);
  }
};

export default initDatabase; 
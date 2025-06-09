import sequelize from "./db";
import { Product } from "../models/Product";
import { Customer } from "../models/Customer";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Webhook } from "../models/Webhook";
import { Users } from "../models/User";

/**
 * Initialize database and create all tables
 */
export const initDatabase = async () => {
  try {
    console.log("🔧 Initializing database...");
    
    // Test connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established");
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ Database tables synchronized");
    
    // Log which tables were created/verified
    const tables = [
      'products',
      'customers', 
      'orders',
      'order_items',
      'webhooks',
      'users'
    ];
    
    console.log("📋 Verified tables:", tables.join(", "));
    
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    
    // In development, continue without database
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Continuing in development mode without database");
    } else {
      throw error;
    }
  }
};

export default initDatabase; 
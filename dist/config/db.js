// src/config/db.ts
import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || "",
    port: parseInt(process.env.DB_PORT || "5432"),
    dialect: "postgres",
    dialectOptions: {
        // Enable SSL for managed databases (DigitalOcean, AWS RDS, etc.)
        // Check if we're using a managed database service that requires SSL
        ssl: process.env.DB_HOST?.includes('digitalocean') ||
            process.env.DB_HOST?.includes('amazonaws') ||
            process.env.DB_HOST?.includes('azure') ||
            process.env.DB_USER === 'doadmin' ||
            process.env.NODE_ENV === "production" ? {
            require: true,
            rejectUnauthorized: false, // Allow self-signed certificates for managed services
        } : false
    },
    // Optimized connection pool settings for production
    pool: {
        max: process.env.NODE_ENV === "production" ? 20 : 5,
        min: process.env.NODE_ENV === "production" ? 5 : 0,
        acquire: 60000, // Increased for better reliability  
        idle: 10000,
        evict: 1000
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    retry: {
        match: [
            /ConnectionError/,
            /ConnectionRefusedError/,
            /ConnectionTimedOutError/,
            /TimeoutError/,
        ],
        max: 3
    }
});
// Test connection (useful in dev mode)
sequelize
    .authenticate()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.error("🔥 Connection error:", err));
export default sequelize;

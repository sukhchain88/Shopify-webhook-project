// src/config/db.ts
import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

// Handle different database URL formats
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided (common in production like Render.com)
  if (process.env.DATABASE_URL) {
    return {
      type: 'url' as const,
      url: process.env.DATABASE_URL,
      dialect: "postgres" as const,
      dialectOptions: {
        ssl: process.env.NODE_ENV === "production" ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    };
  }

  // Fallback to individual environment variables
  const database = process.env.DB_NAME;
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!database || !username || !password) {
    throw new Error("Missing required database environment variables: DB_NAME, DB_USER, DB_PASSWORD");
  }

  return {
    type: 'individual' as const,
    database,
    username,
    password,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    dialect: "postgres" as const,
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production" ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
};

const config = getDatabaseConfig();
const sequelize = config.type === 'url'
  ? new Sequelize(config.url, {
      dialect: config.dialect,
      dialectOptions: config.dialectOptions,
      logging: config.logging,
      pool: config.pool,
    })
  : new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        dialectOptions: config.dialectOptions,
        logging: config.logging,
        pool: config.pool,
      }
    );

// Test connection with retry logic for production
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connected successfully");
      return;
    } catch (error) {
      console.error(`🔥 Connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error("❌ All database connection attempts failed");
        if (process.env.NODE_ENV === "production") {
          process.exit(1); // Exit in production if DB connection fails
        }
      } else {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
};

// Test connection
testConnection();

export default sequelize;

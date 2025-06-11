// src/config/db.ts
import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize Sequelize with proper configuration
const sequelize = (() => {
  // Production: use DATABASE_URL or PostgreSQL config
  if (process.env.NODE_ENV === "production") {
    if (process.env.DATABASE_URL) {
      return new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          }
        },
        pool: {
          max: 20,
          min: 5,
          acquire: 60000,
          idle: 10000,
          evict: 1000
        },
        logging: false,
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
    }
  }

  // Development: use SQLite if no DATABASE_URL or PostgreSQL config
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    console.log("🔧 Using SQLite for development");
    return new Sequelize({
      dialect: "sqlite",
      storage: "./dev-database.sqlite",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
    });
  }

  // PostgreSQL configuration (when DATABASE_URL or DB_* vars are provided)
  const dbConfig = process.env.DATABASE_URL 
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
          ssl: process.env.NODE_ENV === "production" ? {
            require: true,
            rejectUnauthorized: false,
          } : false
        },
        pool: {
          max: process.env.NODE_ENV === "production" ? 20 : 5,
          min: process.env.NODE_ENV === "production" ? 5 : 0,
          acquire: 60000,
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
      })
    : new Sequelize(
        process.env.DB_NAME || "shopify_webhook_db",
        process.env.DB_USER || "postgres", 
        process.env.DB_PASSWORD || "",
        {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT || "5432"),
          dialect: "postgres",
          dialectOptions: {
            ssl: process.env.DB_HOST?.includes('digitalocean') || 
                 process.env.DB_HOST?.includes('amazonaws') ||
                 process.env.DB_HOST?.includes('azure') ||
                 process.env.DB_USER === 'doadmin' ||
                 process.env.NODE_ENV === "production" ? {
              require: true,
              rejectUnauthorized: false,
            } : false
          },
          pool: {
            max: process.env.NODE_ENV === "production" ? 20 : 5,
            min: process.env.NODE_ENV === "production" ? 5 : 0,
            acquire: 60000,
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
        }
      );

  return dbConfig;
})();

// Test connection only in development
if (process.env.NODE_ENV !== "production") {
  sequelize
    .authenticate()
    .then(() => console.log("✅ Database connected"))
    .catch((err: any) => {
      console.error("🔥 Connection error:", err.message);
      console.log("💡 Using SQLite fallback for development");
    });
}

export default sequelize;

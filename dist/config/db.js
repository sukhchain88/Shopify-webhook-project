// src/config/db.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
});
sequelize
    .authenticate()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.error("🔥 Connection error:", err));
export default sequelize;

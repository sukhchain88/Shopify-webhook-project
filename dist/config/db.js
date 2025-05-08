// src\config\db.ts
import dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, } from "../config/config.js";
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT || "5432", 10),
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
});
export default sequelize;

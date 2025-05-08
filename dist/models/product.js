// src\models\product.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
export const Product = sequelize.define("products", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    shopify_product_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "active",
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    tableName: "products",
    timestamps: true,
});

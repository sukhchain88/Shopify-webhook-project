// src\models\customer.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
export const Customer = sequelize.define("customers", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    shop_domain: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    last_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    province: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    zip: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    shopify_customer_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: "customers",
    timestamps: true,
    underscored: true,
});

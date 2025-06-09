"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
// src/models/Product.ts
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
exports.Product = db_1.default.define("products", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    shopify_product_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'draft', 'archived'),
        defaultValue: 'active',
    },
    metadata: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: "products",
    timestamps: false,
    underscored: true,
});

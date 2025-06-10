"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
// src/models/Order.ts
const sequelize_1 = require("sequelize");
const db_js_1 = __importDefault(require("../config/db.js"));
const Customer_js_1 = require("./Customer.js");
exports.Order = db_js_1.default.define("orders", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    shop_domain: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    order_number: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    customer_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Customer_js_1.Customer,
            key: 'id'
        }
    },
    total_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'USD',
    },
    status: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    shopify_order_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    tableName: "orders",
    timestamps: true,
    underscored: true,
});
// Define the relationship between Order and Customer
exports.Order.belongsTo(Customer_js_1.Customer, { foreignKey: 'customer_id' });
Customer_js_1.Customer.hasMany(exports.Order, { foreignKey: 'customer_id' });

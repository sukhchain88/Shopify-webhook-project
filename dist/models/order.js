// src\models\order.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { Customer } from "./customer.js";
export const Order = sequelize.define("orders", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    shop_domain: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    order_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Customer,
            key: 'id'
        }
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'USD',
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    shopify_order_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    tableName: "orders",
    timestamps: true,
    underscored: true,
});
// Define the relationship between Order and Customer
Order.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Order, { foreignKey: 'customer_id' });

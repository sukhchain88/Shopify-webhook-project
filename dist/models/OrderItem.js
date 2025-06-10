"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Order_1 = require("./Order");
const Product_1 = require("./Product");
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order_1.Order,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Product_1.Product,
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    },
    shopify_product_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: 'Shopify product ID for reference'
    },
    shopify_variant_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: 'Shopify variant ID for specific product variant'
    },
    product_title: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
        comment: 'Product title at time of purchase (preserved even if product deleted)'
    },
    product_variant_title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: 'Variant title (size, color, etc.)'
    },
    sku: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: 'Product SKU at time of purchase'
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },
    unit_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Price per unit at time of purchase'
    },
    total_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total price for this line item (quantity × unit_price)'
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'USD'
    },
    discount_amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Discount applied to this line item'
    },
    tax_amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Tax amount for this line item'
    },
    product_metadata: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional product data from Shopify (weight, vendor, etc.)'
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    }
}, {
    sequelize: db_1.default,
    tableName: "order_items",
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['order_id']
        },
        {
            fields: ['product_id']
        },
        {
            fields: ['shopify_product_id']
        },
        {
            fields: ['shopify_variant_id']
        }
    ]
});
OrderItem.belongsTo(Order_1.Order, {
    foreignKey: 'order_id',
    as: 'order'
});
OrderItem.belongsTo(Product_1.Product, {
    foreignKey: 'product_id',
    as: 'product'
});
Order_1.Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'items'
});
Product_1.Product.hasMany(OrderItem, {
    foreignKey: 'product_id',
    as: 'orderItems'
});
exports.default = OrderItem;

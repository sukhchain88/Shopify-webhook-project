import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import sequelize from "../config/db";
import { Order } from "./order";
import { Product } from "./product";

// Define the OrderItem model with proper TypeScript types
export class OrderItem extends Model<InferAttributes<OrderItem>, InferCreationAttributes<OrderItem>> {
  declare id: CreationOptional<number>;
  declare order_id: number;
  declare product_id: number | null;
  declare shopify_product_id: string | null;
  declare shopify_variant_id: string | null;
  declare product_title: string;
  declare product_variant_title: string | null;
  declare sku: string | null;
  declare quantity: number;
  declare unit_price: number;
  declare total_price: number;
  declare currency: string;
  declare discount_amount: number;
  declare tax_amount: number;
  declare product_metadata: object;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

OrderItem.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null if product is deleted
    references: {
      model: Product,
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  shopify_product_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Shopify product ID for reference'
  },
  shopify_variant_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Shopify variant ID for specific product variant'
  },
  product_title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Product title at time of purchase (preserved even if product deleted)'
  },
  product_variant_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Variant title (size, color, etc.)'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Product SKU at time of purchase'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price per unit at time of purchase'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total price for this line item (quantity × unit_price)'
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'USD'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Discount applied to this line item'
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Tax amount for this line item'
  },
  product_metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional product data from Shopify (weight, vendor, etc.)'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
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

// Associations are defined in associations.ts to avoid circular dependencies

export default OrderItem;


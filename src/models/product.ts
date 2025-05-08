// src\models\product.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.js";

interface ProductAttributes {
  id: number;
  shopify_product_id: string | null;
  title: string;
  price: number | null;
  description: string | null;
  status: string | null;
  metadata: any;
}

interface ProductCreationAttributes
  extends Optional<
    ProductAttributes,
    | "id"
    | "shopify_product_id"
    | "price"
    | "description"
    | "status"
    | "metadata"
  > {}

export interface ProductInstance
  extends Model<ProductAttributes, ProductCreationAttributes>,
    ProductAttributes {}

export const Product = sequelize.define<ProductInstance>(
  "products",
  {
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
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

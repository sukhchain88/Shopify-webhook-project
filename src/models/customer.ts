// src\models\customer.ts
import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import sequelize  from "../config/db";

// Define the Customer model with proper TypeScript types
export class Customer extends Model<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
  // Use CreationOptional for fields that are auto-generated or have defaults
  declare id: CreationOptional<number>;
  declare shop_domain: string;
  declare first_name: string | null;
  declare last_name: string | null;
  declare email: string | null;
  declare phone: string | null;
  declare shopify_customer_id: string | null;
  declare address: string | null;
  declare city: string | null;
  declare province: string | null;
  declare country: string | null;
  declare zip: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shop_domain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null emails for guest orders
      // Remove strict email validation for webhook compatibility
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shopify_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    },
  },
  {
    sequelize,
    tableName: "customers",
    timestamps: true,
    underscored: true,
  }
); 
  
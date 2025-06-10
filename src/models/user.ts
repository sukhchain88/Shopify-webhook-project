// src/models/User.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Users = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
    name: {
    type: DataTypes.STRING(255),
    allowNull: true,     
  },
  shop_domain: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  
  access_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

}, {
  tableName: "users",
  timestamps: true,
  underscored: true,
}); 
  
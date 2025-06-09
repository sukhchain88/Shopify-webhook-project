"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
// src/models/User.ts
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
exports.Users = db_1.default.define("users", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    shop_domain: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    access_token: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: "users",
    timestamps: true,
    underscored: true,
});

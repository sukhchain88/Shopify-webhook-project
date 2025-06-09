"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = void 0;
// src\models\webhook.ts
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
exports.Webhook = db_1.default.define("webhooks", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    topic: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    shop_domain: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    payload: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    processed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    processed_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: "webhooks",
    timestamps: false,
    underscored: true
});

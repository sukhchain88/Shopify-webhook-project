import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
export const Webhook = sequelize.define("webhooks", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    topic: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    shop_domain: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    payload: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: "webhooks",
    timestamps: false,
    underscored: true
});

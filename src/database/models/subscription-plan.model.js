import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const SubscriptionPlan = orm.define("SubscriptionPlan", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    label: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    duration_days: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    priority: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    tableName: "subscription_plans",
    timestamps: true,
});

export default SubscriptionPlan;

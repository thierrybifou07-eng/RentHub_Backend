import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const UserSubscription = orm.define("UserSubscription", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    plan_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
    },
    payment_reference: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    admin_note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    tableName: "user_subscriptions",
    timestamps: true,
    indexes: [
        { fields: ["user_id", "status"] },
        { fields: ["plan_id"] },
    ],
});

export default UserSubscription;

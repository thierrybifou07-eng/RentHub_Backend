import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const SubscriptionStatus = orm.define(
  "SubscriptionStatus",
  {
    subscription_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    subscription_status_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    subscription_status_label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "subscription_statuses",
    timestamps: false,
  }
);


export default SubscriptionStatus;

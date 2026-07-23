import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const SubscriptionType = orm.define(
  "SubscriptionType",
  {
    subscription_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    subscription_type_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    subscription_type_label: {
      type: DataTypes.STRING(100),
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
    tableName: "subscription_type",
    timestamps: false,
  }
);


export default SubscriptionType;

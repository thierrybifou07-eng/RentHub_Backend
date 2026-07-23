import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Subscription = orm.define(
  "Subscription",
  {
    subscription_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    subscription_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    subscription_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: false,
  }
);


export default Subscription;

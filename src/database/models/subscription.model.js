import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";
import SubscriptionType from "./subscription-type.model.js";
import SubscriptionStatus from "./subscription-status.model.js";
import User from "./user.model.js";

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
      references: {
        model: SubscriptionType,
        key: 'subscription_type_id'
      }
    },
    subscription_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references:{
        model: SubscriptionStatus,
        key:'subscription_status_id'
      }
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references:{
        model: User,
        key:'user_id'
      }
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

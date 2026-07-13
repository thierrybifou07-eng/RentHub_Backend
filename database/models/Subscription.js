import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import SubscriptionType from "./SubscriptionType.js";
import SubscriptionStatus from "./SubscriptionStatus.js";
import User from "./User.js";

const Subscription = sequelize.define("Subscription", {
  subscription_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  subscription_type_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: SubscriptionType, key: "subscription_type_id" }
  },
  subscription_status_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: SubscriptionStatus, key: "subscription_status_id" }
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: User, key: "user_id" }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: null
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  auto_renew: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: false,
  indexes: [
    { name: "fk_subscription_type", fields: ["subscription_type_id"] },
    { name: "fk_subscription_status", fields: ["subscription_status_id"] },
    { name: "fk_subscription_user", fields: ["user_id"] }
  ]
});

export default Subscription;
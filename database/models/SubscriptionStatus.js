import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const SubscriptionStatus = sequelize.define("Subscription_status", {
  subscription_status_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  subscription_status_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  subscription_status_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

export default SubscriptionStatus;
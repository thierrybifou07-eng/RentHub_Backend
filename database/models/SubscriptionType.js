import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const SubscriptionType = sequelize.define("Subscription_type", {
  subscription_type_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  subscription_type_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  subscription_type_label: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: "subscription_type"
});

export default SubscriptionType;
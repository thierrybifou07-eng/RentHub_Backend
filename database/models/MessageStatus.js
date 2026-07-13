import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const MessageStatus = sequelize.define("Message_status", {
  message_status_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  message_status_code: {
    type: DataTypes.STRING(25),
    allowNull: false,
    unique: true
  },
  message_status_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  timestamps: false,
});

export default MessageStatus;
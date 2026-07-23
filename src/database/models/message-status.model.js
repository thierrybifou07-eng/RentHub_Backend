import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const MessageStatus = orm.define(
  "MessageStatus",
  {
    message_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message_status_code: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    message_status_label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "message_statuses",
    timestamps: false,
  }
);


export default MessageStatus;

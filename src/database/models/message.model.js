import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Message = orm.define(
  "Message",
  {
    message_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    chat_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "messages",
    timestamps: false,
  }
);


export default Message;

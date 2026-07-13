import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import MessageStatus from "./MessageStatus.js";
import Chat from "./Chat.js";
import User from "./User.js";

const Message = sequelize.define("Message", {
  message_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  message_status_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: MessageStatus, key: "message_status_id" }
  },
  chat_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Chat, key: "chat_id" }
  },
  sender_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: User, key: "user_id" }
  },
  content: {
    type: DataTypes.TEXT("long"),
    allowNull: false
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  indexes: [
    { name: "fk_message_status", fields: ["message_status_id"] },
    { name: "fk_message_chat", fields: ["chat_id"] },
    { name: "fk_message_user", fields: ["sender_id"] }
  ]
});

export default Message;
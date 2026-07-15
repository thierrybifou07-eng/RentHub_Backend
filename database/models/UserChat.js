import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";
import User from "./User.js";
import Chat from "./Chat.js";

const UserChat = sequelize.define("User_chat", {
  user_id: {
    primaryKey: true,
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: User, key: "user_id" }
  },
  chat_id: {
    primaryKey: true,
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Chat, key: "chat_id" }
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "user_chat",
  timestamps: false,
  indexes: [
    { name: "fk_user_chat", fields: ["chat_id"] }
  ]
});

export default UserChat;

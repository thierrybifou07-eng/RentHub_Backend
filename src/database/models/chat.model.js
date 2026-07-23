import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Chat = orm.define(
  "Chat",
  {
    chat_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
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
    tableName: "chats",
    timestamps: false,
  }
);


export default Chat;

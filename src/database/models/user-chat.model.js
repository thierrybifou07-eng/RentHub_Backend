import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";
import Chat from "./chat.model.js";

export const UserChat = orm.define(
  "UserChat",
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    chat_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references:{
        model: Chat,
        key:'chat_id'
      }
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "user_chat",
    timestamps: false,
  }
);


export default UserChat;

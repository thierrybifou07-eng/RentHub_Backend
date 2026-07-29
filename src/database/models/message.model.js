import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Message = orm.define(
  "Message",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
    indexes: [{ fields: ["conversation_id"] }],
  }
);

export default Message;

import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Conversation = orm.define(
  "Conversation",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    announcement_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    tenant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["tenant_id", "announcement_id"] },
      { fields: ["owner_id"] },
    ],
  }
);

export default Conversation;

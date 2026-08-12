import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Notification = orm.define(
  "Notification",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    actor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["user_id", "is_read"] },
    ],
  }
);

export default Notification;

import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Report = orm.define(
  "Report",
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
    reporter_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    admin_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "reports",
    timestamps: true,
    indexes: [
      { fields: ["announcement_id"] },
      { fields: ["reporter_id"] },
      { fields: ["status_id"] },
    ],
  }
);

export default Report;

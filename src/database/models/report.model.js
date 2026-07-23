import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Report = orm.define(
  "Report",
  {
    report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    report_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    property_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    announcement_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    report_reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    report_description: {
      type: DataTypes.TEXT("long"),
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
    tableName: "reports",
    timestamps: false,
  }
);


export default Report;

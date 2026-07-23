import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const ReportStatus = orm.define(
  "ReportStatus",
  {
    report_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    report_status_code: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    report_status_label: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    tableName: "report_statuses",
    timestamps: false,
  }
);


export default ReportStatus;

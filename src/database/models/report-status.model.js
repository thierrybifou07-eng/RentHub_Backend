import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const ReportStatus = orm.define(
  "ReportStatus",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "report_statuses",
    timestamps: false,
  }
);

export default ReportStatus;

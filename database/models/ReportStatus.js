import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const ReportStatus = sequelize.define("Report_status", {
  report_status_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  report_status_code: {
    type: DataTypes.STRING(25),
    allowNull: false,
    unique: true
  },
  report_status_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

export default ReportStatus;
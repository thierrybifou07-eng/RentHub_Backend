import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import ReportStatus from "./ReportStatus.js";
import User from "./User.js";
import Property from "./Property.js";
import Announcement from "./Announcement.js";

const Report = sequelize.define("Report", {
  report_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  report_status_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: ReportStatus, key: "report_status_id" }
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: User, key: "user_id" }
  },
  property_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: { model: Property, key: "property_id" }
  },
  announcement_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: { model: Announcement, key: "announcement_id" }
  },
  report_reason: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  report_description: {
    type: DataTypes.TEXT("long"),
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  indexes: [
    { name: "fk_report_status", fields: ["report_status_id"] },
    { name: "fk_report_user", fields: ["user_id"] },
    { name: "fk_report_property", fields: ["property_id"] },
    { name: "fk_report_announcement", fields: ["announcement_id"] }
  ]
});

export default Report;
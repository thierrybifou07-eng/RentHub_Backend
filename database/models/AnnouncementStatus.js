import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";

const AnnouncementStatus = sequelize.define("Announcement_status", {
  announcement_status_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  announcement_status_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  announcement_status_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

export default AnnouncementStatus;

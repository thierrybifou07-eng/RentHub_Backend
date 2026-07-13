import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const AnnouncementType = sequelize.define("Announcement_type", {
  announcement_type_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  announcement_type_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  announcement_type_label: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});

export default AnnouncementType;
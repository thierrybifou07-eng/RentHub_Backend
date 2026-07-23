import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const AnnouncementStatus = orm.define(
  "AnnouncementStatus",
  {
    announcement_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    announcement_status_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    announcement_status_label: {
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
    tableName: "announcement_statuses",
    timestamps: false,
  }
);


export default AnnouncementStatus;

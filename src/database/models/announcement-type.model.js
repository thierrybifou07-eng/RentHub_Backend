import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const AnnouncementType = orm.define(
  "AnnouncementType",
  {
    announcement_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    announcement_type_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    announcement_type_label: {
      type: DataTypes.STRING(100),
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
    tableName: "announcement_types",
    timestamps: false,
  }
);


export default AnnouncementType;

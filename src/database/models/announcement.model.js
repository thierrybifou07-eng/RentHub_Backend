import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Announcement = orm.define(
  "Announcement",
  {
    announcement_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    property_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    announcement_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    announcement_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    lister_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    announcement_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    announcement_description: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    announcement_resume: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    views: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
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
    tableName: "announcements",
    timestamps: false,
  }
);


export default Announcement;

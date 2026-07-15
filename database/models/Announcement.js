import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";
import Property from "./Property.js";
import AnnouncementType from "./AnnouncementType.js";
import AnnouncementStatus from "./AnnouncementStatus.js";
import User from "./User.js";

const Announcement = sequelize.define("Announcement", {
  announcement_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  property_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Property, key: "property_id" }
  },
  announcement_type_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: AnnouncementType, key: "announcement_type_id" }
  },
  announcement_status_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: AnnouncementStatus, key: "announcement_status_id" }
  },
  lister_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: User, key: "user_id" }
  },
  announcement_title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  announcement_description: {
    type: DataTypes.TEXT("long"),
    allowNull: false
  },
  announcement_resume: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
    defaultValue: null
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  views: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    defaultValue: null
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  indexes: [
    { name: "uk_announcement_slug", unique: true, fields: ["slug"] },
    { name: "fk_announcement_property", fields: ["property_id"] },
    { name: "fk_announcement_type", fields: ["announcement_type_id"] },
    { name: "fk_announcement_status", fields: ["announcement_status_id"] },
    { name: "fk_announcement_author", fields: ["lister_id"] }
  ]
});

export default Announcement;

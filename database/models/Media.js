import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";
import MediaType from "./MediaType.js";
import Property from "./Property.js";
import User from "./User.js";

const Media = sequelize.define("Media", {
  media_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  media_type_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: MediaType, key: "media_type_id" }
  },
  property_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: { model: Property, key: "property_id" }
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: { model: User, key: "user_id" }
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  generated_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  media_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  file_size: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  media_position: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: 0
  },
  is_cover: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  indexes: [
    { name: "fk_media_type", fields: ["media_type_id"] },
    { name: "fk_media_property", fields: ["property_id"] },
    { name: "fk_media_user", fields: ["user_id"] }
  ]
});

export default Media;

import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Media = orm.define(
  "Media",
  {
    media_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    media_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    property_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    generated_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    media_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    media_position: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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
    tableName: "media",
    timestamps: false,
  }
);


export default Media;

import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const MediaType = orm.define(
  "MediaType",
  {
    media_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    media_type_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    media_type_label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    media_type_extensions: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    media_type_max_size: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "media_types",
    timestamps: false,
  }
);


export default MediaType;

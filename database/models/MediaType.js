import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";

const MediaType = sequelize.define("Media_type", {
  media_type_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  media_type_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  media_type_label: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  media_type_extensions: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  media_type_max_size: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  }
}, {
  timestamps: false,
});

export default MediaType;

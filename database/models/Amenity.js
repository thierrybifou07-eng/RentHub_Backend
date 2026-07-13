import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const Amenity = sequelize.define("Amenity", {
  amenity_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  amenity_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  amenity_label: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  timestamps: false,
  indexes: [
    { name: "uk_amenity_code", unique: true, fields: ["amenity_code"] }
  ]
});

export default Amenity;
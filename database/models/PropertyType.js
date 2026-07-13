import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const PropertyType = sequelize.define("Property_type", {
  property_type_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  property_type_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  property_type_label: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});

export default PropertyType;
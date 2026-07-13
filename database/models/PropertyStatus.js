import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const PropertyStatus = sequelize.define("Property_Status", {
  property_status_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  property_status_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  property_status_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

export default PropertyStatus;
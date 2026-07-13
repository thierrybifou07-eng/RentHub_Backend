import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import Property from "./Property.js";
import Amenity from "./Amenity.js";

const PropertyAmenities = sequelize.define("Property_Amenities", {
  property_id: {
    primaryKey: true,
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Property, key: "property_id" }
  },
  amenity_id: {
    primaryKey: true,
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Amenity, key: "amenity_id" }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "property_amenities",
  timestamps: false,
  indexes: [
    { name: "fk_property_amenities_amenity", fields: ["amenity_id"] }
  ]
});

export default PropertyAmenities;
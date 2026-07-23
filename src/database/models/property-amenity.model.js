import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const PropertyAmenity = orm.define(
  "PropertyAmenity",
  {
    property_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    amenity_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "property_amenities",
    timestamps: false,
  }
);


export default PropertyAmenity;

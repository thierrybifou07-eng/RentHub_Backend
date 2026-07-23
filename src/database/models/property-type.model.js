import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const PropertyType = orm.define(
  "PropertyType",
  {
    property_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    property_type_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    property_type_label: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    tableName: "property_types",
    timestamps: false,
  }
);


export default PropertyType;

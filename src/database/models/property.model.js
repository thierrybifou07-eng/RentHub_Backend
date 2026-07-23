import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Property = orm.define(
  "Property",
  {
    property_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    property_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    property_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    property_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    property_description: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    property_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    property_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    property_bedrooms: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    property_bathrooms: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    property_surface: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    property_floor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    max_occupants: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    total_rooms: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
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
    tableName: "properties",
    timestamps: false,
  }
);


export default Property;

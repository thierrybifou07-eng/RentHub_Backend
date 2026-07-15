import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";
import PropertyType from "./PropertyType.js";
import City from "./City.js";
import PropertyStatus from "./PropertyStatus.js";
import User from "./User.js";

const Property = sequelize.define("Property", {
  property_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  property_type_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: PropertyType, key: "property_type_id" }
  },
  city_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: City, key: "city_id" }
  },
  property_status_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: PropertyStatus, key: "property_status_id" }
  },
  owner_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: User, key: "user_id" }
  },
  property_title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  property_description: {
    type: DataTypes.TEXT("long"),
    allowNull: false
  },
  property_address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  property_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  property_bedrooms: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: null
  },
  property_bathrooms: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: null
  },
  property_surface: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null
  },
  property_floor: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  max_occupants: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: null
  },
  total_rooms: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: null
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  indexes: [
    { name: "fk_property_type", fields: ["property_type_id"] },
    { name: "fk_property_city", fields: ["city_id"] },
    { name: "fk_property_status", fields: ["property_status_id"] },
    { name: "fk_property_owner", fields: ["owner_id"] }
  ]
});

export default Property;

import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import User from "./User.js";
import Property from "./Property.js";

const Favorites = sequelize.define("Favorites", {
  user_id: {
    primaryKey: true,
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: User, key: "user_id" }
  },
  property_id: {
    primaryKey: true,
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Property, key: "property_id" }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "favorites",
  timestamps: false,
  indexes: [
    { name: "fk_favorites_property", fields: ["property_id"] }
  ]
});

export default Favorites;
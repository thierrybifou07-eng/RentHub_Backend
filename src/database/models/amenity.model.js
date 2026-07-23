import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Amenity = orm.define(
  "Amenity",
  {
    amenity_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    amenity_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amenity_label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "amenities",
    timestamps: false,
  }
);


export default Amenity;

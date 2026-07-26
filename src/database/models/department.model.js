import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";
import Country from "./country.model.js";

export const Department = orm.define(
  "Department",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    country_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: Country,
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "departments",
    timestamps: false,
  }
);


export default Department;

import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import Country from "./Country.js";

const Department = sequelize.define("Department", {
  department_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  country_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Country, key: "country_id" }
  },
  department_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  timestamps: false,
  indexes: [
    {
      name: "uk_department_country_name",
      unique: true,
      fields: ["country_id", "department_name"]
    },
    { name: "fk_department_country", fields: ["country_id"] }
  ]
});

export default Department;
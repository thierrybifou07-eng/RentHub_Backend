import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import Department from "./Department.js";

const City = sequelize.define("City", {
  city_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  department_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Department, key: "department_id" }
  },
  city_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  timestamps: false,
  indexes: [
    { 
      name: "uk_city_department_name", 
      unique: true, 
      fields: ["department_id", "city_name"] 
    },
    { name: "fk_city_department", fields: ["department_id"] }
  ]
});

export default City;
import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Department = orm.define(
  "Department",
  {
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    department_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "departments",
    timestamps: false,
  }
);


export default Department;

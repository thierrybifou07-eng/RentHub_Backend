import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";
import Department from "./department.model.js";

export const City = orm.define(
  "City",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: Department,
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "cities",
    timestamps: false,
  }
);


export default City;

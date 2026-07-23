import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const City = orm.define(
  "City",
  {
    city_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    city_name: {
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

import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Country = orm.define(
  "Country",
  {
    country_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    country_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    tableName: "countries",
    timestamps: false,
  }
);


export default Country;

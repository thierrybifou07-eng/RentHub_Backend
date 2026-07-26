import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Role = orm.define(
  "Role",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(50),
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
    tableName: "roles",
    timestamps: false,
  }
);


export default Role;

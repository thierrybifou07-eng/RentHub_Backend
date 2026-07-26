import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const UserStatus = orm.define(
  "UserStatus",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(25),
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
    tableName: "user_statuses",
    timestamps: false,
  }
);


export default UserStatus;

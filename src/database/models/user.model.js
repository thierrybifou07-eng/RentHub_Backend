import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const User = orm.define(
  "User",
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    firstname: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    city_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);


export default User;

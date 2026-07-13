import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import City from "./City.js";
import Role from "./Role.js";
import UserStatus from "./UserStatus.js";

const User = sequelize.define("User", {
  user_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  firstname: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: null
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null
  },
  city_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: { model: City, key: "city_id" }
  },
  role_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Role, key: "role_id" }
  },
  user_status_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: UserStatus, key: "user_status_id" }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: false,
  indexes: [
    { name: "uk_user_email", unique: true, fields: ["email"] },
    { name: "fk_user_city", fields: ["city_id"] },
    { name: "fk_user_role", fields: ["role_id"] },
    { name: "fk_user_status", fields: ["user_status_id"] }
  ]
});

export default User;
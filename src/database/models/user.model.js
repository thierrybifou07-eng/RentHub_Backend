import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";
import { hashPassword } from "../../modules/auth/password.js";

export const User = orm.define(
  "User",
  {
    id: {
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
      defaultValue: 1,
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
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  defaultScope: {
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt', 'deleted_at']
    },
  },
  scopes: {
    withPassword: { attributes: { include: ['password'] } },
    onlyId: { attributes: ['id'] }
  },
  indexes: [
    { fields: ['role_id'] },
    { fields: ['city_id'] },
    { fields: ['user_status_id'] },
  ],
  hooks: {
    beforeCreate: async (user, options) => {
      user.password = await hashPassword(user.password)
    },
    beforeUpdate: async (user, options) => {
      if (user && user.password && user.changed('password')) user.password = await hashPassword(user.password)
    },
    beforeBulkCreate: async (users, options) => {
      for (const user of users) {
        if (user.password) user.password = await hashPassword(user.password)
      }
    },
    beforeBulkUpdate: async (options) => {
      if (options.attributes && options.attributes.password) {
        options.attributes.password = await hashPassword(options.attributes.password)
      }
    },
    afterCreate(user, options) {
      if (user && user.dataValues.password) delete user.dataValues.password
    },
  }
});


export default User;


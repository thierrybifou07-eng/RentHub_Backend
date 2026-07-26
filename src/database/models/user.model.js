import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";
import City from "./city.model.js";
import Role from "./role.model.js";
import UserStatus from "./user-status.model.js";
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
      reference: {
        model: City,
        key: "id"
      }
    },
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      reference: {
        model: Role,
        key: "id"
      }
    },
    user_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      reference: {
        model: UserStatus,
        key: "id"
      }
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
    avatar: {
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
  defaultScope: {
    attributes: {
      exclude: ['password']
    },
  },
  scopes: {
    withPassword: { attributes: { include: ['password'] } },
  },
  hooks: {
    beforeCreate: async (user, options) => {
      user.password = await hashPassword(user.password)
    },
    beforeUpdate: async (user, options) => {
      if (user && user.password && user.changed('password')) user.password = await hashPassword(user.password)
    },
    afterCreate(user, options) {
      if (user && user.dataValues.password) delete user.dataValues.password
    },
    afterFind(result, options) {
      if (!result) return;

      // Gérer les résultats multiples (findAll) et uniques (findOne)
      
      const users = Array.isArray(result) ? result : [result]

      users.forEach(user => {
        if (user && user.dataValues) {
          delete user.dataValues.file
        }
      });
    }
  }
});


export default User;

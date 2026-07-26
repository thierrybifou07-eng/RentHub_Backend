import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Otp = orm.define(
  "otp",
  {
    code: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "otps",
    timestamps: true
  }
);

export default Otp;

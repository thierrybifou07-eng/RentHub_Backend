import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Otp = orm.define(
  "otp",
  {
    code: {
      type: DataTypes.INTEGER(9),
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "otps",
    timestamps: true,
    indexes: [
      { fields: ['user_id'] }
    ]
  }
);


export default Otp;

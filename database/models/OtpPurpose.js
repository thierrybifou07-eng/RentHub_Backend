import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";

const OtpPurpose = sequelize.define("Otp_purpose", {
  otp_purpose_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  otp_purpose_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  otp_purpose_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

export default OtpPurpose;

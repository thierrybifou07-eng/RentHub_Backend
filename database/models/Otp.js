import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";
import User from './User.js'
import OtpPurpose from './OtpPurpose.js'
const OTP = sequelize.define("OTP", {
    otp_id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: User, key: 'user_id' }
    },
    otp_code: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    purpose_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: OtpPurpose, key: 'otp_purpose_id' }
    },
    channel: {
        type: DataTypes.ENUM('email', 'sms'),
        allowNull: false,
    },
    destination: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'otps',
    indexes: [
        { name: "fk_otp_purpose", fields: ["purpose_id"] },
        { name: "fk_otp_user", fields: ["user_id"] }
    ],
    paranoid: false
});

export default OTP;

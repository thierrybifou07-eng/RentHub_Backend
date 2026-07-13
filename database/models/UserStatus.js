import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const UserStatus = sequelize.define("User_status", {
  user_status_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  user_status_code: {
    type: DataTypes.STRING(25),
    allowNull: false,
    unique: true
  },
  user_status_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

export default UserStatus;
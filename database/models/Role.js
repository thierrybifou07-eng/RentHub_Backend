import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const Role = sequelize.define("Role", {
  role_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  role_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  role_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

export default Role;
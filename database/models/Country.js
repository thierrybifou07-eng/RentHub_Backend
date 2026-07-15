import { DataTypes } from "sequelize";
import sequelize from "../../src/config/sequelize_app.js";

const Country = sequelize.define("Country", {
  country_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  country_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
});

export default Country;

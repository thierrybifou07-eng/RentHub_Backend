import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const PropertyStatus = orm.define(
  "PropertyStatus",
  {
    property_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    property_status_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    property_status_label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "property_statuses",
    timestamps: false,
  }
);


export default PropertyStatus;

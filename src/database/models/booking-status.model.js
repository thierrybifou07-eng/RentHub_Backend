import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const BookingStatus = orm.define(
  "BookingStatus",
  {
    booking_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_status_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    booking_status_label: {
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
    tableName: "booking_statuses",
    timestamps: false,
  }
);


export default BookingStatus;

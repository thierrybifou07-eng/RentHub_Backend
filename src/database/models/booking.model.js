import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Booking = orm.define(
  "Booking",
  {
    booking_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_status_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    tenant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    property_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "bookings",
    timestamps: false,
  }
);


export default Booking;

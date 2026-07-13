import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";
import BookingStatus from "./BookingStatus.js";
import User from "./User.js";
import Property from "./Property.js";

const Booking = sequelize.define("Booking", {
  booking_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  booking_status_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: BookingStatus, key: "booking_status_id" }
  },
  tenant_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: User, key: "user_id" }
  },
  property_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: Property, key: "property_id" }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: null
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  indexes: [
    { name: "fk_booking_status", fields: ["booking_status_id"] },
    { name: "fk_booking_user", fields: ["tenant_id"] },
    { name: "fk_booking_property", fields: ["property_id"] }
  ]
});

export default Booking;
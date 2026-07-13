import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize_app.js";

const BookingStatus = sequelize.define("Booking_status", {
  booking_status_id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT.UNSIGNED
  },
  booking_status_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  booking_status_label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

export default BookingStatus;
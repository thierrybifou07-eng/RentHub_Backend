import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Session = orm.define(
  "session",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(64), // sha256 hex digest = 64 caractères
      allowNull: false,
      unique: true,
    },
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45), // couvre IPv6
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "sessions",
    timestamps: true,
    indexes: [{ fields: ["user_id"] }],
  }
);

export default Session;

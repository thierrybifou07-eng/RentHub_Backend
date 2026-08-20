import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const AuditLog = orm.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    actor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    actor_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    actor_role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    target_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["actor_id"] },
      { fields: ["action"] },
      { fields: ["target_type", "target_id"] },
      { fields: ["createdAt"] },
      { fields: ["actor_email"] },
    ],
  }
);

export default AuditLog;

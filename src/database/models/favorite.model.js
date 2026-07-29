import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Favorite = orm.define(
  "Favorite",
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    announcement_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "favorites",
    timestamps: true,
    updatedAt: false,
  }
);

export default Favorite;

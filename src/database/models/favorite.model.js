import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

export const Favorite = orm.define(
  "Favorite",
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    property_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "favorites",
    timestamps: false,
  }
);


export default Favorite;

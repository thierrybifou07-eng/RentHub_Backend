import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

const AnnouncementStatus = orm.define("AnnouncementStatus", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    label: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: "announcement_statuses",
    timestamps: false,
});

export default AnnouncementStatus;

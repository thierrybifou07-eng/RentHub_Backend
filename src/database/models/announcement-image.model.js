import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

const AnnouncementImage = orm.define("AnnouncementImage", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    announcement_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: "announcement_images",
    timestamps: true,
});

export default AnnouncementImage;

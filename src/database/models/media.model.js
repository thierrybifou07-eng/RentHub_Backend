import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

const Media = orm.define("Media", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    media_type_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    mime_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    file_size: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    mediable_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    mediable_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: "media",
    timestamps: true,
    indexes: [
        { fields: ["mediable_type", "mediable_id"] },
        { fields: ["media_type_id"] },
    ],
});

export default Media;
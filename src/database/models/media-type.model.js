import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

const MediaType = orm.define("MediaType", {
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
    allowed_extensions: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    allowed_mimetypes: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    max_file_size: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    max_files: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
    },
    width: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    height: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
}, {
    tableName: "media_types",
    timestamps: false,
});

export default MediaType;
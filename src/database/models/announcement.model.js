import { DataTypes } from "sequelize";
import orm from "../../../config/sequelize_app.js";

const Announcement = orm.define("Announcement", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    surface_area: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    rooms: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
    },
    bedrooms: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
    },
    bathrooms: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
    },
    furnished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    property_type_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    city_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    status_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
}, {
    tableName: "announcements",
    paranoid: true,
    defaultScope: {
        attributes: { exclude: ["deleted_at"] },
    },
    scopes: {
        active: {
            where: { status_id: 1 },
        },
    },
});

export default Announcement;

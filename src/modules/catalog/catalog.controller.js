import { City, PropertyType } from "../../database/models/index.js";
import { success } from "../../shared/helpers/response.helpers.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

export const getCities = async (req, res) => {
    try {
        const cities = await City.findAll({
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });

        return res.status(200).json(success("Cities retrieved successfully", cities));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getPropertyTypes = async (req, res) => {
    try {
        const types = await PropertyType.findAll({
            attributes: ["id", "code", "label"],
            order: [["label", "ASC"]],
        });

        return res.status(200).json(success("Property types retrieved successfully", types));
    } catch (err) {
        return handleServerError(res, err);
    }
};

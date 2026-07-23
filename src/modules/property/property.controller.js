import { fail, success } from "../../shared/helpers/appHelper.js";

export const getAppartments = async (req, res) => {
  console.log("The appartments");
  return res.status(200).json(success("The appartments"));
};

export const getAppartmentsById = async (req, res) => {
  const { id } = req.params;
  if (id > 100) return res.status(404).json(fail("not found"));
  return res.status(200).json(success(`The appartment with the id ${id}`, id));
};

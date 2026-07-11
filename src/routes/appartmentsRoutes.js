import express from "express"
import { getAppartments, getAppartmentsById } from "../controller/appartmentsController.js";

const appartmentsRouter = express.Router();

appartmentsRouter.get('/appartments', getAppartments)
appartmentsRouter.get('/appartments/:id', getAppartmentsById)

export { appartmentsRouter }
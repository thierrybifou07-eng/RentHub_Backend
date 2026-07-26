import express from "express";
import cors from "cors";
import '../config/env.js';
import apiRouter from "./routes.js";
/* import { corsOptions } from "../config/corsOptions.js"; */
import "./database/setupAssociations.js";

const app = express();

/* app.use(cors(corsOptions)); */
app.use(express.json());

app.use('/api/v1', apiRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Le serveur est ouvert sur le port http://localhost:${port}`);
});
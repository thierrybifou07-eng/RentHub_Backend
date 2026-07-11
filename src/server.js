import express from "express";
import { appartmentsRouter } from "./routes/appartmentsRoutes.js";

const app = express();

app.use(express.json());

const port = 3000;
app.use('/api', appartmentsRouter)
app.listen(port, () => {
    console.log('Le serveur est ouvert sur le port http://localhost:' + port);

});
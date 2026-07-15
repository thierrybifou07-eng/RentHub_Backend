import express from 'express';
import '../config/env.js';
const app = express();

app.use(express.json());

const port = process.env.PORT;
app.listen(port, () => {
    console.log('Le serveur est ouvert sur le port http://localhost:' + port);

});
import express from "express";

const app = express();

app.use(express.json());

const port = 3000;
app.use('/api/v1')
app.listen(port, () => {
    console.log('Le serveur est ouvert sur le port http://localhost:' + port);

});
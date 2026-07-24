import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
    host: "localhost",
    user: "node_1_1_db",
    password: "#+*node@237",
})

await connection.query('CREATE DATABASE IF NOT EXISTS node_1_1_db')

console.log("base de donnée node_1_1_db creée avec succès !!!")
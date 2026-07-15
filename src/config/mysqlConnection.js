import mysql from "mysql2/promise";
import './env.js'

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

await connection.query('CREATE DATABASE IF NOT EXISTS rentHub')

console.log("base de donnée rentHub creée avec succès !!!")
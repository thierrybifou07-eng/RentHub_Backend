import { Sequelize } from "sequelize";

const orm = new Sequelize(
    "node_1_1_db",
    "node_1_1_db",
    "#+*node@237",
    {
        host: "localhost",
        dialect: "mysql"
    }
)

export default orm
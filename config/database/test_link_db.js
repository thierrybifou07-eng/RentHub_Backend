import sequelize from "../sequelize_app.js";
try {
    await sequelize.authenticate()
    console.log("Authentification reussie !!!");

} catch (e) {
    console.error(e);
}
import "../setupAssociations.js";
import orm from "../../config/sequelize_app.js";

const runMigration = async () => {
  try {
    await orm.authenticate();
    console.log("Database authenticated successfully.");

    await orm.sync({ alter: true });
    console.log("Sequelize models synced with the database.");

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

await runMigration();

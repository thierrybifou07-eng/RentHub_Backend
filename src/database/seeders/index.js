import "../setupAssociations.js";
import orm from "../../../config/sequelize_app.js";
import seedRoles from "./role.seeder.js";
import seedUserStatuses from "./user-status.seeder.js";
import seedCountries from "./country.seeder.js";
import seedDepartments from "./department.seeder.js";
import seedCities from "./city.seeder.js";
import seedUsers from "./user.seeder.js";

const runSeeders = async () => {
  try {
    await orm.authenticate();
    console.log("Database authenticated successfully.");

    await seedRoles();
    await seedUserStatuses();
    await seedCountries();
    await seedDepartments();
    await seedCities();
    await seedUsers();

    console.log("All seeders completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

await runSeeders();

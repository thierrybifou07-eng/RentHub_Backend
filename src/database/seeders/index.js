import "../setupAssociations.js";
import orm from "../../../config/sequelize_app.js";
import seedRoles from "./role.seeder.js";
import seedUserStatuses from "./user-status.seeder.js";
import seedCountries from "./country.seeder.js";
import seedDepartments from "./department.seeder.js";
import seedCities from "./city.seeder.js";
import seedPropertyTypes from "./property-type.seeder.js";
import seedAnnouncementStatuses from "./announcement-status.seeder.js";
import seedMediaTypes from "./media-type.seeder.js";
import seedReportStatuses from "./report-status.seeder.js";
import seedSubscriptionPlans from "./subscription-plan.seeder.js";
import seedUsers from "./user.seeder.js";
import seedAnnouncements from "./announcement.seeder.js";
import seedRootUser from "./root-user.seeder.js";
import seedAuditLogs from "./audit-log.seeder.js";

const runSeeders = async () => {
  try {
    await orm.authenticate();
    console.log("Database authenticated successfully.");

    await seedRoles();
    await seedUserStatuses();
    await seedCountries();
    await seedDepartments();
    await seedCities();
    await seedPropertyTypes();
    await seedAnnouncementStatuses();
    await seedMediaTypes();
    await seedReportStatuses();
    await seedSubscriptionPlans();
    await seedUsers();
    await seedRootUser();
    await seedAnnouncements();
    await seedAuditLogs();

    console.log("All seeders completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

await runSeeders();

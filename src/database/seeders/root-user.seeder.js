import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import UserStatus from "../models/user-status.model.js";
import City from "../models/city.model.js";

const seedRootUser = async () => {
  const existingRoot = await User.findOne({
    where: { email: "root@renthub.com" },
    paranoid: false,
  });
  if (existingRoot) {
    console.log("Root user already exists, skipping...");
    return;
  }

  const roleRoot = await Role.findOne({ where: { code: "ROLE_ROOT" } });
  const statusActive = await UserStatus.findOne({ where: { code: "ACTIVE" } });
  const cities = await City.findAll();
  const defaultCity = cities[0] || null;

  await User.create({
    firstname: "Super",
    lastname: "Admin",
    email: "root@renthub.com",
    password: "Root@12345",
    phone: "+237600000001",
    gender: "Homme",
    role_id: roleRoot.id,
    user_status_id: statusActive.id,
    city_id: defaultCity?.id || null,
    email_verified_at: new Date(),
    verified_at: new Date(),
  });

  console.log("Root user seeded successfully (root@renthub.com).");
};

export default seedRootUser;

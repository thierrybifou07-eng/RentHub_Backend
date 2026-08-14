import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import UserStatus from "../models/user-status.model.js";
import City from "../models/city.model.js";
import { faker } from "@faker-js/faker";

const seedUsers = async () => {
  const count = await User.count();
  if (count > 0) {
    console.log("Users table already seeded, skipping...");
    return;
  }

  const roleAdmin = await Role.findOne({ where: { code: "ROLE_ADMIN" } });
  const roleTenant = await Role.findOne({ where: { code: "ROLE_TENANT" } });
  const roleOwner = await Role.findOne({ where: { code: "ROLE_OWNER" } });
  const statusActive = await UserStatus.findOne({ where: { code: "ACTIVE" } });
  const cities = await City.findAll();

  const admin = {
    firstname: "Admin",
    lastname: "RentHub",
    email: "admin@renthub.com",
    password: "Admin@12345",
    phone: "+237600000000",
    gender: "Homme",
    role_id: roleAdmin.id,
    user_status_id: statusActive.id,
    city_id: cities[0].id,
    email_verified_at: new Date(),
    verified_at: new Date(),
  };

  const users = [admin];

  for (let i = 0; i < 19; i++) {
    const gender = faker.person.sexType();
    users.push({
      firstname: faker.person.firstName(gender),
      lastname: faker.person.lastName(gender),
      email: faker.internet.email(),
      password: "User@12345",
      phone: `+2376${faker.string.numeric(8)}`,
      gender: gender === "male" ? "Homme" : "Femme",
      birth_date: faker.date.birthdate({ min: 18, max: 60, mode: "age" }),
      role_id: faker.helpers.arrayElement([roleTenant.id, roleOwner.id]),
      user_status_id: statusActive.id,
      city_id: faker.helpers.arrayElement(cities).id,
      address: faker.location.streetAddress(),
      email_verified_at: new Date(),
    });
  }

  await User.bulkCreate(users, { individualHooks: true });
  console.log(`${users.length} users seeded successfully.`);
};

export default seedUsers;

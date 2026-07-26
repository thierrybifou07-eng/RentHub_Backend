import Role from "../models/role.model.js";

const seedRoles = async () => {
  const count = await Role.count();
  if (count > 0) {
    console.log("Roles table already seeded, skipping...");
    return;
  }

  const roles = [
    { code: "ROLE_USER", label: "Utilisateur" },
    { code: "ROLE_ADMIN", label: "Administrateur" },
    { code: "ROLE_ROOT", label: "Super Administrateur" },
  ];

  await Role.bulkCreate(roles, { individualHooks: true });
  console.log(`${roles.length} roles seeded successfully.`);
};

export default seedRoles;

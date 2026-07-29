import Role from "../models/role.model.js";

const seedRoles = async () => {
  const roles = [
    { code: "ROLE_USER", label: "Utilisateur" },
    { code: "ROLE_ADMIN", label: "Administrateur" },
    { code: "ROLE_ROOT", label: "Super Administrateur" },
    { code: "ROLE_TENANT", label: "Locataire" },
    { code: "ROLE_OWNER", label: "Propriétaire" },
    { code: "ROLE_AGENCY", label: "Agence" },
  ];

  for (const role of roles) {
    await Role.findOrCreate({ where: { code: role.code }, defaults: role });
  }
  console.log(`${roles.length} roles seeded successfully.`);
};

export default seedRoles;

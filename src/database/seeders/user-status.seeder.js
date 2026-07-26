import UserStatus from "../models/user-status.model.js";

const seedUserStatuses = async () => {
  const count = await UserStatus.count();
  if (count > 0) {
    console.log("UserStatuses table already seeded, skipping...");
    return;
  }

  const statuses = [
    { code: "ACTIVE", label: "Actif" },
    { code: "INACTIVE", label: "Inactif" },
    { code: "SUSPENDED", label: "Suspendu" },
    { code: "PENDING_VERIFICATION", label: "En attente de vérification" },
  ];

  await UserStatus.bulkCreate(statuses, { individualHooks: true });
  console.log(`${statuses.length} user statuses seeded successfully.`);
};

export default seedUserStatuses;

import AnnouncementStatus from "../models/announcement-status.model.js";

const seedAnnouncementStatuses = async () => {
  const count = await AnnouncementStatus.count();
  if (count > 0) {
    console.log("Announcement statuses already seeded, skipping.");
    return;
  }

  await AnnouncementStatus.bulkCreate([
    { code: "ACTIVE", label: "Active" },
    { code: "PENDING_REVIEW", label: "En attente de validation" },
    { code: "RENTED", label: "Louée" },
    { code: "ARCHIVED", label: "Archivée" },
    { code: "REJECTED", label: "Rejetée" },
  ]);

  console.log("Announcement statuses seeded successfully.");
};

export default seedAnnouncementStatuses;

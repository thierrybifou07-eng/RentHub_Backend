import ReportStatus from "../models/report-status.model.js";

const seedReportStatuses = async () => {
  const statuses = [
    { code: "PENDING", label: "En attente" },
    { code: "REVIEWED", label: "Examiné" },
    { code: "DISMISSED", label: "Rejeté" },
    { code: "ACTION_TAKEN", label: "Action prise" },
  ];

  for (const status of statuses) {
    await ReportStatus.findOrCreate({ where: { code: status.code }, defaults: status });
  }
  console.log(`${statuses.length} report statuses seeded successfully.`);
};

export default seedReportStatuses;

import Department from "../models/department.model.js";
import Country from "../models/country.model.js";

const seedDepartments = async () => {
  const count = await Department.count();
  if (count > 0) {
    console.log("Departments table already seeded, skipping...");
    return;
  }

  const country = await Country.findOne({ where: { name: "Cameroun" } });
  if (!country) {
    console.error("Country 'Cameroun' not found. Run country seeder first.");
    return;
  }

  const departments = [
    { country_id: country.id, name: "Adamaoua" },
    { country_id: country.id, name: "Centre" },
    { country_id: country.id, name: "Est" },
    { country_id: country.id, name: "Extrême-Nord" },
    { country_id: country.id, name: "Littoral" },
    { country_id: country.id, name: "Nord" },
    { country_id: country.id, name: "Nord-Ouest" },
    { country_id: country.id, name: "Ouest" },
    { country_id: country.id, name: "Sud" },
    { country_id: country.id, name: "Sud-Ouest" },
  ];

  await Department.bulkCreate(departments);
  console.log(`${departments.length} departments seeded successfully.`);
};

export default seedDepartments;

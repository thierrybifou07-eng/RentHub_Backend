import City from "../models/city.model.js";
import Department from "../models/department.model.js";

const seedCities = async () => {
  const count = await City.count();
  if (count > 0) {
    console.log("Cities table already seeded, skipping...");
    return;
  }

  const deptNames = [
    "Centre", "Littoral", "Nord-Ouest", "Extrême-Nord",
    "Nord", "Est", "Ouest", "Adamaoua", "Sud", "Sud-Ouest"
  ];

  const departments = await Department.findAll();
  const deptMap = {};
  departments.forEach(d => { deptMap[d.name] = d.id; });

  const cities = [
    { department_id: deptMap["Centre"], name: "Yaoundé" },
    { department_id: deptMap["Littoral"], name: "Douala" },
    { department_id: deptMap["Nord-Ouest"], name: "Bamenda" },
    { department_id: deptMap["Extrême-Nord"], name: "Maroua" },
    { department_id: deptMap["Nord"], name: "Garoua" },
    { department_id: deptMap["Est"], name: "Bertoua" },
    { department_id: deptMap["Ouest"], name: "Bafoussam" },
    { department_id: deptMap["Sud"], name: "Kribi" },
    { department_id: deptMap["Sud-Ouest"], name: "Limbe" },
    { department_id: deptMap["Sud-Ouest"], name: "Buea" },
  ];

  await City.bulkCreate(cities);
  console.log(`${cities.length} cities seeded successfully.`);
};

export default seedCities;

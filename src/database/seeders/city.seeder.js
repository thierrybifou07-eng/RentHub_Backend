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

  // Fail fast if a department is missing, instead of silently
  // inserting cities with an undefined department_id.
  deptNames.forEach((name) => {
    if (!deptMap[name]) {
      throw new Error(
        `Department "${name}" not found. Make sure departments are seeded before cities.`
      );
    }
  });

  const citiesByDepartment = {
    "Centre": [
      "Yaoundé", "Mbalmayo", "Obala", "Bafia", "Akonolinga",
      "Mfou", "Monatélé", "Nanga-Eboko", "Ntui", "Eséka",
      "Sa'a", "Ngoumou", "Soa", "Bikok", "Ayos"
    ],
    "Littoral": [
      "Douala", "Nkongsamba", "Edéa", "Loum", "Manjo",
      "Mbanga", "Melong", "Yabassi", "Dibombari", "Penja",
      "Njombé-Penja"
    ],
    "Nord-Ouest": [
      "Bamenda", "Kumbo", "Wum", "Ndop", "Nkambe",
      "Fundong", "Mbengwi", "Bafut", "Bali", "Batibo",
      "Mbiame", "Njikwa"
    ],
    "Extrême-Nord": [
      "Maroua", "Kousséri", "Mokolo", "Yagoua", "Kaélé",
      "Mora", "Waza", "Méri", "Guidiguis", "Bogo"
    ],
    "Nord": [
      "Garoua", "Guider", "Poli", "Tcholliré", "Figuil",
      "Pitoa", "Rey-Bouba", "Lagdo"
    ],
    "Est": [
      "Bertoua", "Batouri", "Yokadouma", "Abong-Mbang", "Garoua-Boulaï",
      "Ndélélé", "Bélabo", "Doumé", "Lomié"
    ],
    "Ouest": [
      "Bafoussam", "Dschang", "Mbouda", "Foumban", "Foumbot",
      "Bandjoun", "Bangangté", "Bafang"
    ],
    "Adamaoua": [
      "Ngaoundéré", "Meiganga", "Tibati", "Banyo", "Tignère",
      "Ngaoundal"
    ],
    "Sud": [
      "Ebolowa", "Kribi", "Sangmélima", "Ambam", "Djoum",
      "Mvangan", "Campo"
    ],
    "Sud-Ouest": [
      "Buea", "Limbe", "Kumba", "Mamfe", "Tiko",
      "Muyuka", "Idenau", "Fontem", "Ekondo-Titi", "Mundemba"
    ]
  };

  const cities = Object.entries(citiesByDepartment).flatMap(([deptName, cityNames]) =>
    cityNames.map((name) => ({ department_id: deptMap[deptName], name }))
  );

  await City.bulkCreate(cities);
  console.log(`${cities.length} cities seeded successfully.`);
};

export default seedCities;

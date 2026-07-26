import Country from "../models/country.model.js";

const seedCountries = async () => {
  const count = await Country.count();
  if (count > 0) {
    console.log("Countries table already seeded, skipping...");
    return;
  }

  const countries = [
    { name: "Cameroun" },
  ];

  await Country.bulkCreate(countries);
  console.log(`${countries.length} countries seeded successfully.`);
};

export default seedCountries;

import PropertyType from "../models/property-type.model.js";

const seedPropertyTypes = async () => {
  const count = await PropertyType.count();
  if (count > 0) {
    console.log("Property types already seeded, skipping.");
    return;
  }

  await PropertyType.bulkCreate([
    { code: "APARTMENT", label: "Appartement" },
    { code: "HOUSE", label: "Maison" },
    { code: "STUDIO", label: "Studio" },
    { code: "COMMERCIAL", label: "Local commercial" },
  ]);

  console.log("Property types seeded successfully.");
};

export default seedPropertyTypes;

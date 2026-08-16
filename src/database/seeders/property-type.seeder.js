import PropertyType from "../models/property-type.model.js";

const seedPropertyTypes = async () => {
  const count = await PropertyType.count();
  if (count > 0) {
    console.log("Property types already seeded, skipping.");
    return;
  }

  await PropertyType.bulkCreate([
    { code: "APARTMENT", label: "Appartement" },
    { code: "ROOM", label: "Chambre" },
    { code: "HOUSE", label: "Maison" },
    { code: "STUDIO", label: "Studio" },
    { code: "COMMERCIAL_LOCAL", label: "Local commercial" },
    { code: "VILLA", label: "Villa" },
    { code: "WAREHOUSE", label: "Entrepôt" },
    { code: "OFFICE", label: "Bureau" },
    { code: "SHOP", label: "Boutique" },
    { code: "GODOWN", label: "Magasin" },
  ]);

  console.log("Property types seeded successfully.");
};

export default seedPropertyTypes;

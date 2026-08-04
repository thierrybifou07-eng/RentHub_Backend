import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { faker } from "@faker-js/faker";
import Announcement from "../models/announcement.model.js";
import Media from "../models/media.model.js";
import MediaType from "../models/media-type.model.js";
import User from "../models/user.model.js";
import City from "../models/city.model.js";
import PropertyType from "../models/property-type.model.js";

const IMAGE_COLORS = ["#e11d48", "#0ea5e9", "#10b981", "#f59e0b"];
const IMAGE_DIR = fileURLToPath(new URL("../../../public/uploads/announcement-image/", import.meta.url));
const UPLOADS_PATH = "public/uploads/announcement-image";

function buildSvg(color, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${color}"/>
  <rect x="130" y="110" width="140" height="110" fill="#ffffff" opacity="0.9"/>
  <polygon points="80,130 200,60 320,130" fill="#ffffff"/>
  <rect x="175" y="150" width="50" height="70" fill="${color}"/>
  <rect x="145" y="140" width="30" height="30" fill="#cbd5e1"/>
  <text x="200" y="250" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#ffffff">${label}</text>
</svg>`;
}

function generateSeedImages() {
  const generated = [];
  mkdirSync(IMAGE_DIR, { recursive: true });

  for (let index = 0; index < IMAGE_COLORS.length; index++) {
    const filename = `seed-${index + 1}.svg`;
    const filePath = resolve(IMAGE_DIR, filename);
    const color = IMAGE_COLORS[index];
    writeFileSync(filePath, buildSvg(color, `Annonce ${index + 1}`), "utf8");
    generated.push(filename);
  }

  return generated;
}

const seedAnnouncements = async () => {
  const count = await Announcement.count();
  if (count > 0) {
    console.log("Announcements table already seeded, skipping...");
    return;
  }

  const [users, cities, propertyTypes, announcementImageType, mediaFiles] = await Promise.all([
    User.findAll(),
    City.findAll(),
    PropertyType.findAll(),
    MediaType.findOne({ where: { code: "ANNOUNCEMENT_IMAGE" } }),
    generateSeedImages(),
  ]);

  if (!users.length || !cities.length || !propertyTypes.length) {
    throw new Error("Missing reference data (users, cities or property types) to seed announcements.");
  }

  const imageFilenames = [];
  for (let index = 0; index < mediaFiles.length; index++) {
    const filename = mediaFiles[index];
    imageFilenames.push({
      filename,
      url: `${UPLOADS_PATH}/${filename}`,
      size: Buffer.byteLength(buildSvg(IMAGE_COLORS[index], `Annonce ${index + 1}`), "utf8"),
    });
  }

  const announcements = [];
  const mediaItems = [];

  for (let index = 0; index < 15; index++) {
    const propertyType = faker.helpers.arrayElement(propertyTypes);
    const city = faker.helpers.arrayElement(cities);
    const user = faker.helpers.arrayElement(users);
    const rooms = faker.number.int({ min: 1, max: 6 });
    const bedrooms = faker.number.int({ min: 1, max: rooms });
    const bathrooms = faker.number.int({ min: 1, max: Math.max(bedrooms, 2) });
    const createdAt = faker.date.recent({ days: 60 });
    const adjectives = ["Moderne", "Chaleureux", "Spacieux", "Lumineux", "Cosy", "Rénové", "Fonctionnel", "Agréable"];
    const title = `${faker.helpers.arrayElement(adjectives)} ${propertyType.label.toLowerCase()} à ${city.name}`;

    announcements.push({
      title,
      description: faker.lorem.paragraphs(2),
      price: faker.number.float({ min: 350, max: 2500, multipleOf: 50 }),
      surface_area: faker.number.float({ min: 30, max: 250, multipleOf: 5 }),
      rooms,
      bedrooms,
      bathrooms,
      furnished: faker.datatype.boolean({ probability: 0.4 }),
      property_type_id: propertyType.id,
      city_id: city.id,
      user_id: user.id,
      status_id: 1,
      createdAt,
      updatedAt: createdAt,
    });
  }

  const created = await Announcement.bulkCreate(announcements);

  created.forEach((announcement, index) => {
    const primary = faker.helpers.arrayElement(imageFilenames);
    mediaItems.push({
      media_type_id: announcementImageType.id,
      url: primary.url,
      filename: primary.filename,
      mime_type: "image/svg+xml",
      file_size: primary.size,
      is_primary: true,
      mediable_id: announcement.id,
      mediable_type: "Announcement",
    });

    if (faker.datatype.boolean({ probability: 0.5 })) {
      const secondary = faker.helpers.arrayElement(imageFilenames);
      mediaItems.push({
        media_type_id: announcementImageType.id,
        url: secondary.url,
        filename: secondary.filename,
        mime_type: "image/svg+xml",
        file_size: secondary.size,
        is_primary: false,
        mediable_id: announcement.id,
        mediable_type: "Announcement",
      });
    }
  });

  await Media.bulkCreate(mediaItems);
  console.log(`${created.length} announcements and ${mediaItems.length} media seeded successfully.`);
};

export default seedAnnouncements;

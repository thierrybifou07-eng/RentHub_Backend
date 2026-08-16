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

const IMAGE_COLORS = [
  { primary: "#0F172A", accent: "#38BDF8" }, // Slate + Cyan premium
  { primary: "#1E293B", accent: "#22C55E" }, // Slate + Green
  { primary: "#111827", accent: "#F59E0B" }, // Gray + Amber
  { primary: "#0B1120", accent: "#EC4899" }, // Deep Blue + Pink
];

const IMAGE_DIR = fileURLToPath(new URL("../../../public/uploads/ANNOUNCEMENT_IMAGE/", import.meta.url));
const UPLOADS_PATH = "public/uploads/ANNOUNCEMENT_IMAGE";

function buildSvg(colors, label, index) {
  const { primary, accent } = colors;
  const patterns = [
    // Pattern 1: Geometric Grid
    `<pattern id="grid${index}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${accent}20" stroke-width="1"/></pattern>`,
    // Pattern 2: Dots
    `<pattern id="dots${index}" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${accent}30"/></pattern>`,
    // Pattern 3: Waves
    `<pattern id="wave${index}" width="60" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q15 0 30 10 T60 10" fill="none" stroke="${accent}20" stroke-width="1.5"/></pattern>`,
    // Pattern 4: Diagonal
    `<pattern id="diag${index}" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="${accent}15" stroke-width="1"/></pattern>`,
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img">
  <defs>
    <linearGradient id="bg${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accent}40;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${index}">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${accent}" flood-opacity="0.25"/>
    </filter>
    ${patterns[index % patterns.length]}
  </defs>

  <!-- Background gradient + pattern -->
  <rect width="400" height="300" fill="url(#bg${index})"/>
  <rect width="400" height="300" fill="url(#${['grid', 'dots', 'wave', 'diag'][index % 4]}${index})"/>

  <!-- Glass Card -->
  <g filter="url(#shadow${index})">
    <rect x="60" y="70" width="280" height="160" rx="24" fill="#FFFFFF10" stroke="#FFFFFF20" stroke-width="1.5"/>
    <rect x="60" y="70" width="280" height="160" rx="24" fill="url(#bg${index})" opacity="0.3"/>
  </g>

  <!-- Accent shape -->
  <circle cx="320" cy="80" r="40" fill="${accent}" opacity="0.15"/>
  <circle cx="80" cy="230" r="30" fill="${accent}" opacity="0.1"/>

  <!-- Icon central minimaliste -->
  <g transform="translate(200, 150)">
    <rect x="-30" y="-25" width="60" height="50" rx="12" fill="none" stroke="${accent}" stroke-width="2.5"/>
    <circle cx="0" cy="-5" r="8" fill="${accent}"/>
    <path d="M-20 15 L-5 5 L5 15 L20 5" stroke="${accent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </g>

  <!-- Texte premium -->
  <text x="200" y="265" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF" letter-spacing="0.5">${label}</text>
  <text x="200" y="40" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#FFFFFF80" letter-spacing="2">ANNONCE</text>
</svg>`;
}

export function generateSeedImages() {
  const generated = [];
  mkdirSync(IMAGE_DIR, { recursive: true });

  for (let index = 0; index < IMAGE_COLORS.length; index++) {
    const filename = `seed-${index + 1}.svg`;
    const filePath = resolve(IMAGE_DIR, filename);
    const colors = IMAGE_COLORS[index];

    writeFileSync(filePath, buildSvg(colors, `Annonce ${index + 1}`, index), "utf8");
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

  for (let index = 0; index < 9; index++) {
    const propertyType = faker.helpers.arrayElement(propertyTypes);
    const city = faker.helpers.arrayElement(cities);
    const user = faker.helpers.arrayElement(users);
    const rooms = faker.number.int({ min: 1, max: 6 });
    const bedrooms = faker.number.int({ min: 1, max: rooms });
    const bathrooms = faker.number.int({ min: 1, max: Math.max(bedrooms, 2) });
    const createdAt = faker.date.recent({ days: 60 });
    const adjectives = ["Moderne", "Chaleureux", "Spacieux", "Lumineux", "Moins chère", "Cosy", "Rénové", "Fonctionnel", "Agréable"];
    const title = `${faker.helpers.arrayElement(adjectives)} ${propertyType.label.toLowerCase()} à ${city.name}`;

    announcements.push({
      title,
      description: faker.lorem.paragraphs(3),
      price: faker.number.float({ min: 15000, max: 250000, multipleOf: 100 }),
      surface_area: faker.number.float({ min: 16, max: 250, multipleOf: 5 }),
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

import MediaType from "../models/media-type.model.js";

const seedMediaTypes = async () => {
  const count = await MediaType.count();
  if (count > 0) {
    console.log("Media types already seeded, skipping.");
    return;
  }

  await MediaType.bulkCreate([
    {
      code: "USER_AVATAR",
      label: "Photo de profil",
      allowed_extensions: ["jpg", "jpeg", "png", "webp"],
      allowed_mimetypes: ["image/jpeg", "image/png", "image/webp"],
      max_file_size: 5 * 1024 * 1024,
      max_files: 1,
    },
    {
      code: "ANNOUNCEMENT_IMAGE",
      label: "Image d'annonce",
      allowed_extensions: ["jpg", "jpeg", "png", "webp", "gif"],
      allowed_mimetypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      max_file_size: 10 * 1024 * 1024,
      max_files: 10,
    },
    {
      code: "ANNOUNCEMENT_VIDEO",
      label: "Vidéo d'annonce",
      allowed_extensions: ["mp4", "webm", "mov"],
      allowed_mimetypes: ["video/mp4", "video/webm", "video/quicktime"],
      max_file_size: 100 * 1024 * 1024,
      max_files: 3,
    },
  ]);

  console.log("Media types seeded successfully.");
};

export default seedMediaTypes;

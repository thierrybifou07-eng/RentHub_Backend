import { Media } from "../../database/models/index.js";
import { forbidden, notFound, unauthorized } from "../../shared/helpers/response.helpers.js";

export async function isMediaOwner(req, res, next) {
  if (!req.user) return res.status(401).json(unauthorized());

  const media = await Media.findByPk(req.params.mediaId || req.params.id);

  if (!media) return res.status(404).json(notFound("Media not found"));

  const modelMap = { User: "user_id" };

  if (media.mediable_type === "User" && media.mediable_id !== req.user.id) {
    return res.status(403).json(forbidden());
  }

  req.media = media;
  next();
}

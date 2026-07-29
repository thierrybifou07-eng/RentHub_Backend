import { Router } from "express";
import { uploadAvatar, deleteAvatar, getMyMedia } from "./media.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import createUpload from "../../../config/media/upload.js";
import MEDIA_TYPE_CODES from "./mediaType.js";

const router = Router();

let avatarUpload;
const getAvatarUpload = async () => {
  if (!avatarUpload) avatarUpload = await createUpload(MEDIA_TYPE_CODES.USER_AVATAR);
  return avatarUpload;
};

router.post("/users/me/avatar", authenticate, async (req, res, next) => {
  const upload = await getAvatarUpload();
  upload.single("avatar")(req, res, (err) => {
    if (err) return res.status(400).json({ status: "fail", message: err.message });
    next();
  });
}, uploadAvatar);

router.delete("/users/me/avatar", authenticate, deleteAvatar);
router.get("/users/me/media", authenticate, getMyMedia);

export default router;

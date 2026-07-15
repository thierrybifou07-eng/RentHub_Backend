import { Router } from "express";
const router = Router();

router.get("/status", (req, res) => {
  res.json({ message: "Auth module is working" });
});

export default router;

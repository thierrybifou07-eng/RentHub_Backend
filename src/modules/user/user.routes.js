import { Router } from "express";
const router = Router();

router.get("/status", (req, res) => {
  res.json({ message: "User module is working" });
});

export default router;

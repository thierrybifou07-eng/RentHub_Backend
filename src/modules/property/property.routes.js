import { Router } from "express";
const router = Router();

router.get("/status", (req, res) => {
  res.json({ message: "Property module is working" });
});

export default router;

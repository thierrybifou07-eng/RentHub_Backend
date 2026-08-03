import { Router } from "express";
import {
    createReport,
    getAllReports,
    getReport,
    reviewReport,
    dismissReport,
    takeActionOnReport,
} from "./report.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import validate from "../../shared/middlewares/validate.js";
import { createReportSchema, reportFilterSchema, adminNoteSchema } from "./report.schema.js";
import { isAdmin } from "../admin/admin.middleware.js";

const router = Router();

router.post("/", authenticate, validate(createReportSchema), createReport);
router.get("/admin", authenticate, isAdmin, validate(reportFilterSchema, "query"), getAllReports);
router.get("/admin/:id", authenticate, isAdmin, parseIdParam, getReport);
router.patch("/admin/:id/review", authenticate, isAdmin, parseIdParam, reviewReport);
router.patch("/admin/:id/dismiss", authenticate, isAdmin, parseIdParam, validate(adminNoteSchema), dismissReport);
router.patch("/admin/:id/take-action", authenticate, isAdmin, parseIdParam, validate(adminNoteSchema), takeActionOnReport);

export default router;

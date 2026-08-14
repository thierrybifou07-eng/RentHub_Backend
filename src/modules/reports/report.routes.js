import { Router } from "express";
import {
    createReport,
    getAllReports,
    getReport,
    reviewReport,
    dismissReport,
    takeActionOnReport,
} from "./report.controller.js";
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import validate from "../../shared/middlewares/validate.js";
import { createReportSchema, reportFilterSchema, adminNoteSchema } from "./report.schema.js";
import { isAdmin } from "../admin/admin.middleware.js";

const router = Router();

router.post("/", authenticate, userHasVerifiedEmail, userIsActive, validate(createReportSchema), createReport);
router.get("/admin", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, validate(reportFilterSchema, "query"), getAllReports);
router.get("/admin/:id", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, getReport);
router.patch("/admin/:id/review", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, reviewReport);
router.patch("/admin/:id/dismiss", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, validate(adminNoteSchema), dismissReport);
router.patch("/admin/:id/take-action", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, validate(adminNoteSchema), takeActionOnReport);

export default router;

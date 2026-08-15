import { Op } from "sequelize";
import { Report, ReportStatus, Announcement, User } from "../../database/models/index.js";
import ANNOUNCEMENT_STATUS from "../announcements/announcementStatus.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { notify, notifyAdmins } from "../notifications/notification.helpers.js";
import {
    success,
    created,
    paginated,
    notFound,
    forbidden,
    badRequest,
} from "../../shared/helpers/response.helpers.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

export const createReport = async (req, res) => {
    try {
        const { announcementId, reason } = req.body;

        const announcement = await Announcement.findByPk(announcementId, {
            attributes: ["id", "user_id"],
            paranoid: false,
        });

        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        if (announcement.user_id === req.user.id) {
            return res.status(400).json(badRequest("You cannot report your own announcement"));
        }

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const recent = await Report.findOne({
            where: {
                announcement_id: announcementId,
                reporter_id: req.user.id,
                createdAt: { [Op.gte]: since },
            },
        });

        if (recent) {
            return res.status(429).json({
                status: "fail",
                message: "You have already reported this announcement in the last 24 hours",
            });
        }

        const report = await Report.create({
            announcement_id: announcementId,
            reporter_id: req.user.id,
            reason,
            status_id: 1,
        });

        await notifyAdmins({
            type: "new_report",
            title: "Nouveau signalement",
            body: reason,
            data: { reportId: report.id, announcementId },
            actorId: req.user.id,
        });

        return res.status(201).json(created("Report submitted successfully", report));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getAllReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const where = {};
        if (req.query.status_id) where.status_id = req.query.status_id;

        const { count, rows } = await Report.findAndCountAll({
            where,
            include: [
                { model: Announcement, attributes: ["id", "title", "status_id"] },
                { model: User, as: "reporter", attributes: ["id", "firstname", "lastname", "email"] },
                { model: ReportStatus, as: "status", attributes: ["id", "code", "label"] },
                { model: User, as: "admin", attributes: ["id", "firstname", "lastname"] },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        return res.status(200).json(paginated("Reports retrieved successfully", rows, {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id, {
            include: [
                { model: Announcement, paranoid: false },
                { model: User, as: "reporter", attributes: ["id", "firstname", "lastname", "email"] },
                { model: ReportStatus, as: "status", attributes: ["id", "code", "label"] },
                { model: User, as: "admin", attributes: ["id", "firstname", "lastname"] },
            ],
        });

        if (!report) return res.status(404).json(notFound("Report not found"));

        return res.status(200).json(success("Report retrieved successfully", report));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const reviewReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (!report) return res.status(404).json(notFound("Report not found"));

        if (report.status_id !== 1) {
            return res.status(400).json(badRequest("Report has already been processed"));
        }

        await report.update({ status_id: 2, admin_id: req.user.id });

        await notify(report.reporter_id, {
            type: "report_reviewed",
            title: "Signalement en cours de traitement",
            body: "Votre signalement a été pris en compte par l'équipe de modération.",
            data: { reportId: report.id },
            actorId: req.user.id,
        });

        return res.status(200).json(success("Report marked as reviewed", report));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const dismissReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (!report) return res.status(404).json(notFound("Report not found"));

        if (report.status_id !== 1) {
            return res.status(400).json(badRequest("Report has already been processed"));
        }

        await report.update({
            status_id: 3,
            admin_id: req.user.id,
            admin_note: req.body.adminNote || null,
        });

        await notify(report.reporter_id, {
            type: "report_dismissed",
            title: "Signalement clôturé",
            body: "Votre signalement a été examiné et aucune suite n'a été donnée.",
            data: { reportId: report.id },
            actorId: req.user.id,
        });

        return res.status(200).json(success("Report dismissed", report));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const takeActionOnReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id, {
            include: [
                { model: Announcement, attributes: ["id", "title", "user_id"] },
            ],
        });

        if (!report) return res.status(404).json(notFound("Report not found"));

        if (report.status_id !== 1) {
            return res.status(400).json(badRequest("Report has already been processed"));
        }

        const adminNote = req.body.adminNote || "Your announcement has been removed following a report";

        await report.update({
            status_id: 4,
            admin_id: req.user.id,
            admin_note: adminNote,
        });

        await Announcement.update(
            { status_id: ANNOUNCEMENT_STATUS.REJECTED },
            { where: { id: report.announcement_id } }
        );

        try {
            const owner = await User.findByPk(report.Announcement.user_id, {
                attributes: ["email", "lastname", "firstname"],
            });
            if (owner) {
                await sendTemplateEmail(owner.email, "Annonce supprimée suite à un signalement", "announcementRejected", {
                    username: `${owner.lastname} ${owner.firstname}`,
                    announcementTitle: report.Announcement.title,
                    reason: adminNote,
                    heading: "Annonce supprimée suite à un signalement"

                });
            }
        } catch (e) {
            console.error(e.message);
        }

        await notify(report.reporter_id, {
            type: "report_action_taken",
            title: "Action prise sur votre signalement",
            body: "L'annonce signalée a été retirée suite à votre signalement.",
            data: { reportId: report.id },
            actorId: req.user.id,
        });

        await notify(report.Announcement.user_id, {
            type: "announcement_rejected",
            title: "Annonce supprimée suite à un signalement",
            body: report.Announcement.title,
            data: { announcementId: report.announcement_id, reportId: report.id },
            actorId: req.user.id,
        });

        return res.status(200).json(success("Action taken on report", report));
    } catch (err) {
        return handleServerError(res, err);
    }
};

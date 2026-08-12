import { Op } from "sequelize";
import { Conversation, Message, Announcement, User } from "../../database/models/index.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { ROLE_IDS } from "../../../config/auth/app.js";
import {
    success,
    created,
    paginated,
    notFound,
    conflict,
    forbidden,
    badRequest,
} from "../../shared/helpers/response.helpers.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

const participantCheck = (conversation, userId) => {
    return conversation.tenant_id === userId || conversation.owner_id === userId;
};

export const startConversation = async (req, res) => {
    try {
        if (req.user.role !== ROLE_IDS.TENANT) {
            return res.status(403).json(forbidden("Only tenants can start a conversation"));
        }

        const { announcementId, content } = req.body;

        const announcement = await Announcement.findByPk(announcementId, {
            attributes: ["id", "title", "user_id", "status_id"],
        });

        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        if (announcement.user_id === req.user.id) {
            return res.status(400).json(badRequest("You cannot start a conversation on your own announcement"));
        }

        const existing = await Conversation.findOne({
            where: { tenant_id: req.user.id, announcement_id: announcementId },
        });

        if (existing) return res.status(409).json(conflict("You already have a conversation about this announcement"));

        const conversation = await Conversation.create({
            announcement_id: announcementId,
            tenant_id: req.user.id,
            owner_id: announcement.user_id,
            last_message: content,
        });

        const message = await Message.create({
            conversation_id: conversation.id,
            sender_id: req.user.id,
            content,
        });

        const owner = await User.findByPk(announcement.user_id, { attributes: ["id", "email", "lastname", "firstname"] });
        const tenant = await User.findByPk(req.user.id, { attributes: ["id", "lastname", "firstname"] });

        try {
            if (owner && tenant) {
                await sendTemplateEmail(owner.email, "Nouveau message pour votre annonce", "newConversation", {
                    ownerName: `${owner.lastname} ${owner.firstname}`,
                    tenantName: `${tenant.lastname} ${tenant.firstname}`,
                    announcementTitle: announcement.title,
                    messagePreview: content.length > 200 ? content.substring(0, 200) + "..." : content,
                    heading: "Nouveau message pour votre annonce"

                });
            }
        } catch (e) {
            console.error(e.message);
        }

        return res.status(201).json(created("Conversation started", { conversation, message }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getMyConversations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await Conversation.findAndCountAll({
            where: {
                [Op.or]: [
                    { tenant_id: req.user.id },
                    { owner_id: req.user.id },
                ],
            },
            include: [
                { model: Announcement, attributes: ["id", "title", "price", "status_id"] },
                { model: User, as: "tenant", attributes: ["id", "firstname", "lastname"] },
                { model: User, as: "owner", attributes: ["id", "firstname", "lastname"] },
            ],
            order: [["updatedAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        const filterRowns = rows.filter(a => a.Announcement !== null
        )
        return res.status(200).json(paginated("Conversations retrieved successfully", filterRowns, {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { tenant_id: req.user.id },
                    { owner_id: req.user.id },
                ],
            },
            attributes: ["id"],
        });

        const conversationIds = conversations.map((c) => c.id);

        if (conversationIds.length === 0) {
            return res.status(200).json(success("Unread count retrieved", { count: 0 }));
        }

        const count = await Message.count({
            where: {
                conversation_id: { [Op.in]: conversationIds },
                sender_id: { [Op.ne]: req.user.id },
                read_at: null,
            },
        });

        return res.status(200).json(success("Unread count retrieved", { count }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getMessages = async (req, res) => {
    try {
        const conversationId = req.params.id;

        const conversation = await Conversation.findByPk(conversationId);

        if (!conversation) return res.status(404).json(notFound("Conversation not found"));

        if (!participantCheck(conversation, req.user.id)) {
            return res.status(403).json(forbidden("You are not a participant in this conversation"));
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        await Message.update(
            { read_at: new Date() },
            {
                where: {
                    conversation_id: conversationId,
                    sender_id: { [Op.ne]: req.user.id },
                    read_at: null,
                },
            }
        );

        const { count, rows } = await Message.findAndCountAll({
            where: { conversation_id: conversationId },
            include: [
                { model: User, as: "sender", attributes: ["id", "firstname", "lastname"] },
            ],
            order: [["createdAt", "ASC"]],
            limit,
            offset,
        });

        return res.status(200).json(paginated("Messages retrieved successfully", rows, {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const sendMessage = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const { content } = req.body;

        const conversation = await Conversation.findByPk(conversationId);

        if (!conversation) return res.status(404).json(notFound("Conversation not found"));

        if (!participantCheck(conversation, req.user.id)) {
            return res.status(403).json(forbidden("You are not a participant in this conversation"));
        }

        const message = await Message.create({
            conversation_id: conversationId,
            sender_id: req.user.id,
            content,
        });
        conversation.last_message = message.content;
        await conversation.save();

        return res.status(201).json(created("Message sent", message));
    } catch (err) {
        return handleServerError(res, err);
    }
};

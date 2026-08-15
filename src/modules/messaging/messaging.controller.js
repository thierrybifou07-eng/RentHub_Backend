import { Op } from "sequelize";
import { Conversation, Message, Announcement, User, Media, MediaType } from "../../database/models/index.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { getIO } from "../../realtime/socket.js";
import { notify } from "../notifications/notification.helpers.js";
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

// Avatar USER_AVATAR d'un utilisateur (média polymorphique mediable_type = "User").
// Fabrique : un objet neuf à chaque appel pour éviter les collisions d'alias Sequelize.
const avatarInclude = () => ({
    model: Media,
    required: false,
    attributes: ["id", "url", "is_primary"],
    include: [
        {
            model: MediaType,
            required: true,
            where: { code: "USER_AVATAR" },
            attributes: ["id", "code"],
        },
    ],
});

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

        // Temps réel : prévenir le propriétaire d'une nouvelle conversation + message
        const io = getIO();
        if (io) {
            io.to(`user:${announcement.user_id}`).emit("conversation:new", {
                conversationId: conversation.id,
                announcementId,
                message: message.toJSON(),
            });
            io.to(`user:${announcement.user_id}`).emit("message:new", {
                conversationId: conversation.id,
                message: message.toJSON(),
            });
        }

        await notify(announcement.user_id, {
            type: "new_message",
            title: "Nouvelle conversation",
            body: content.length > 120 ? content.substring(0, 120) + "…" : content,
            data: { conversationId: conversation.id, announcementId },
            actorId: req.user.id,
        });

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
                { model: User, as: "tenant", attributes: ["id", "firstname", "lastname"], include: [avatarInclude()] },
                { model: User, as: "owner", attributes: ["id", "firstname", "lastname"], include: [avatarInclude()] },
            ],
            order: [["updatedAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        const filterRowns = rows.filter(a => a.Announcement !== null
        )

        // Unread + dernier message par conversation, pour l'utilisateur connecté
        const ids = filterRowns.map((c) => c.id);
        let unreadMap = {};
        let lastMessageAtMap = {};

        if (ids.length > 0) {
            const unreadRows = await Message.findAll({
                where: {
                    conversation_id: { [Op.in]: ids },
                    sender_id: { [Op.ne]: req.user.id },
                    read_at: null,
                },
                attributes: [
                    "conversation_id",
                    [Message.sequelize.fn("COUNT", Message.sequelize.col("id")), "unread_count"],
                ],
                group: ["conversation_id"],
                raw: true,
            });

            const lastRows = await Message.findAll({
                where: { conversation_id: { [Op.in]: ids } },
                attributes: [
                    "conversation_id",
                    [Message.sequelize.fn("MAX", Message.sequelize.col("createdAt")), "last_message_at"],
                ],
                group: ["conversation_id"],
                raw: true,
            });

            unreadMap = unreadRows.reduce((acc, row) => {
                acc[row.conversation_id] = Number(row.unread_count) || 0;
                return acc;
            }, {});
            lastMessageAtMap = lastRows.reduce((acc, row) => {
                acc[row.conversation_id] = row.last_message_at;
                return acc;
            }, {});
        }

        const result = filterRowns.map((c) => ({
            ...c.toJSON(),
            unread_count: unreadMap[c.id] || 0,
            last_message_at: lastMessageAtMap[c.id] || null,
        }));

        return res.status(200).json(paginated("Conversations retrieved successfully", result, {
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
                { model: User, as: "sender", attributes: ["id", "firstname", "lastname"], include: [avatarInclude()] },
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

        // Temps réel : prévenir l'autre participant
        const recipientId = conversation.tenant_id === req.user.id
            ? conversation.owner_id
            : conversation.tenant_id;
        const io = getIO();
        if (io) {
            io.to(`user:${recipientId}`).emit("message:new", {
                conversationId: conversation.id,
                message: message.toJSON(),
            });
        }

        await notify(recipientId, {
            type: "new_message",
            title: "Nouveau message",
            body: content.length > 120 ? content.substring(0, 120) + "…" : content,
            data: { conversationId: conversation.id },
            actorId: req.user.id,
        });

        return res.status(201).json(created("Message sent", message));
    } catch (err) {
        return handleServerError(res, err);
    }
};

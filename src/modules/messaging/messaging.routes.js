import { Router } from "express";
import {
    startConversation,
    getMyConversations,
    getUnreadCount,
    getMessages,
    sendMessage,
} from "./messaging.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import validate from "../../shared/middlewares/validate.js";
import { startConversationSchema, sendMessageSchema, conversationFilterSchema } from "./messaging.schema.js";

const router = Router();

router.post("/", authenticate, validate(startConversationSchema), startConversation);
router.get("/", authenticate, validate(conversationFilterSchema, "query"), getMyConversations);
router.get("/unread-count", authenticate, getUnreadCount);
router.get("/:id/messages", authenticate, parseIdParam, getMessages);
router.post("/:id/messages", authenticate, parseIdParam, validate(sendMessageSchema), sendMessage);

export default router;

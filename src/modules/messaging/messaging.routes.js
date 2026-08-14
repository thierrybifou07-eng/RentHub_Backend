import { Router } from "express";
import {
    startConversation,
    getMyConversations,
    getUnreadCount,
    getMessages,
    sendMessage,
} from "./messaging.controller.js";
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import validate from "../../shared/middlewares/validate.js";
import { startConversationSchema, sendMessageSchema, conversationFilterSchema } from "./messaging.schema.js";

const router = Router();

router.post("/", authenticate, userHasVerifiedEmail, userIsActive, validate(startConversationSchema), startConversation);
router.get("/", authenticate, userHasVerifiedEmail, userIsActive, validate(conversationFilterSchema, "query"), getMyConversations);
router.get("/unread-count", authenticate, userHasVerifiedEmail, userIsActive, getUnreadCount);
router.get("/:id/messages", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, getMessages);
router.post("/:id/messages", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, validate(sendMessageSchema), sendMessage);

export default router;

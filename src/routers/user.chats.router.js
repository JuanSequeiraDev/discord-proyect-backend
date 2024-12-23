import { Router } from "express";
import { createUserChatController, getChatMessagesController, getUserContactsInfo, sendMessageController } from "../controllers/user.chats.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const userChatsRouter = Router()

userChatsRouter.post('/:user_id', authMiddleware , createUserChatController)
userChatsRouter.get('/:user_id', authMiddleware, getUserContactsInfo)
userChatsRouter.post('/message/:chat_id', authMiddleware , sendMessageController)
userChatsRouter.get('/message/:chat_id', authMiddleware , getChatMessagesController)

export default userChatsRouter
import { Router } from "express";
import { createWorkspaceChannelController, createWorkspaceController, getChannelMessagesController, getWorkspaceChannelsController, inviteUserToWorkspaceController, joinUserToWorkspaceController, sendChannelMessageController } from "../controllers/workspace.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const workspaceRouter = Router()

workspaceRouter.get('/channels/:workspace_id', authMiddleware, getWorkspaceChannelsController)
workspaceRouter.post('/create/:user_id', authMiddleware, createWorkspaceController)
workspaceRouter.post('/channels/:workspace_id', authMiddleware, createWorkspaceChannelController)
workspaceRouter.post('/channels/message/:channel_id', authMiddleware, sendChannelMessageController)
workspaceRouter.get('/channels/message/:channel_id', authMiddleware, getChannelMessagesController)
workspaceRouter.post('/invite/:owner_id', authMiddleware, inviteUserToWorkspaceController)
workspaceRouter.get('/join/:invitation_token', authMiddleware, joinUserToWorkspaceController)


export default workspaceRouter
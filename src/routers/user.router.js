import { Router } from "express";
import {verifyEmailController, registerController, loginController, forgotPasswordController, resetPasswordController, deleteUserController} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const userRouter = Router()

userRouter.post('/login', loginController)
userRouter.post('/register', registerController)
userRouter.get('/verify-email/:verification_token', verifyEmailController )
userRouter.delete('/delete/:user_id' , deleteUserController)
userRouter.put('/reset-password/:reset_token' , resetPasswordController)
userRouter.post('/forgot-password' , forgotPasswordController)

export default userRouter
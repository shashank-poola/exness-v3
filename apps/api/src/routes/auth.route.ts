import express from 'express';
import { signInVerify, signupHandler } from '../controller/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = express();

authRouter.get('/health', authMiddleware ,(req, res) => {
    console.log("server is running fine")
    res.json({})
})

authRouter.post('/signup', signupHandler);
authRouter.post('/signin', signInVerify)

export default authRouter;
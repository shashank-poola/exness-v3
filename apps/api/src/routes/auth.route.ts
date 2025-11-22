import express from 'express';
import { signInVerify, signupHandler } from '../controller/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = express();

authRouter.post('/signup', signupHandler);
authRouter.get('/signin', signInVerify)


authRouter.get('/health', authMiddleware ,(req, res) => {
    console.log("server is running fine")
    res.json({})
})

export default authRouter;
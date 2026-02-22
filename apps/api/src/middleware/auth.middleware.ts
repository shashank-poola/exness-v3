import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}

export async function authMiddleware( req: Request, res: Response, next: NextFunction) {
  try {
    
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: null,
        error: "AUTHORIZED_HEADER_MISSING" 
      })
      return;
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ 
        success: false,
        message: null,
        error: "INVALID_TOKEN, BEARER_TOKEN_REQUIRED"
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };

    req.user = payload.email;

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(500).json({
      success: false,
      message: null,
      error: "INTERNAL_SERVER_ERROR" 
    })
    return;
  }
}

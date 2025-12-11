import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string; // or { email: string } if you want an object later
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    
    // Expect header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid authorization format" });
    }

    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };

    // Attach to request
    req.user = payload.email;

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

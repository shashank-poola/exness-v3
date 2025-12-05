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

    console.log('Auth header received:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const [type, token] = authHeader.split(" ");

    console.log('Token type:', type);
    console.log('Token (first 20 chars):', token?.substring(0, 20));

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid authorization format" });
    }

    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };

    console.log('Token verified successfully for:', payload.email);

    // Attach to request
    req.user = payload.email;

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

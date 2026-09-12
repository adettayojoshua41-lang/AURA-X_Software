import { Request, Response, NextFunction } from "express";
import {
  extractTokenFromHeader,
  verifyAccessToken,
  TokenPayload,
} from "./auth";
import logger from "./logger";

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: TokenPayload;
  userId?: number;
}

// Authentication middleware
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers["authorization"];
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({ error: "Missing authentication token" });
      return;
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = payload;
    req.userId = payload.userId;
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// Optional authentication - doesn't fail if no token, but extracts if present
export function optionalAuthentication(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers["authorization"];
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        req.user = payload;
        req.userId = payload.userId;
      }
    }
    next();
  } catch (error) {
    logger.error("Optional authentication error:", error);
    next();
  }
}

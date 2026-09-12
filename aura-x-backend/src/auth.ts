import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "./config";
import logger from "./logger";

// Type definitions
export interface TokenPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

// Password hashing and verification
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error("Error hashing password:", error);
    throw error;
  }
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error("Error verifying password:", error);
    return false;
  }
}

// JWT token generation
export function generateAccessToken(payload: TokenPayload): string {
  try {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as Parameters<typeof jwt.sign>[2]["expiresIn"],
    });
  } catch (error) {
    logger.error("Error generating access token:", error);
    throw error;
  }
}

export function generateTokens(payload: TokenPayload): AuthTokens {
  try {
    const accessToken = generateAccessToken(payload);
    return { accessToken };
  } catch (error) {
    logger.error("Error generating tokens:", error);
    throw error;
  }
}

// JWT token verification
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (error) {
    logger.debug("Invalid access token:", error);
    return null;
  }
}

// Extract token from Bearer header
export function extractTokenFromHeader(
  authHeader: string | undefined,
): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(.{8,})$/;
  return passwordRegex.test(password);
}

// Generate random token (for password reset, etc.)
export function generateRandomToken(length: number = 32): string {
  return require("crypto").randomBytes(length).toString("hex");
}

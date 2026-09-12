import { Router } from "express";
import {
  signup,
  login,
  getCurrentUser,
  updateProfile,
  getProfile,
} from "./controllers";
import { authenticateToken } from "./middleware";

export const router = Router();

// Public routes
router.post("/auth/signup", signup);
router.post("/auth/login", login);

// Protected routes
router.get("/auth/me", authenticateToken, getCurrentUser);

// Profile routes (protected)
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

// Health check
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

export default router;

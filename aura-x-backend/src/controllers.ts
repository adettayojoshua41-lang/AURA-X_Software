import { Response } from "express";
import { AuthRequest } from "./middleware";
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  isValidEmail,
  isStrongPassword,
} from "./auth";
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  asyncHandler,
} from "./errors";
import { userRepository, profileRepository } from "./models";
import logger from "./logger";

// Signup
export const signup = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    if (!isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (!isStrongPassword(password)) {
      throw new ValidationError(
        "Password must be at least 8 characters with uppercase, lowercase, and numbers",
      );
    }

    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
    });

    // Create student profile
    await profileRepository.create(user.id);

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken: tokens.accessToken,
    });
  },
);

// Login
export const login = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AuthenticationError("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken: tokens.accessToken,
    });
  },
);

// Get current user
export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AuthenticationError("User not authenticated");
    }

    const user = await userRepository.findById(req.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const profile = await profileRepository.findByUserId(req.userId);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      profile: profile,
    });
  },
);

// Update user profile
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AuthenticationError("User not authenticated");
    }

    const {
      firstName,
      lastName,
      university,
      department,
      level,
      semester,
      academicYear,
      gpa,
      bio,
      profileImageUrl,
    } = req.body;

    // Update user info if provided
    if (firstName || lastName) {
      await userRepository.update(req.userId, {
        first_name: firstName,
        last_name: lastName,
      });
    }

    // Update profile info
    const profile = await profileRepository.update(req.userId, {
      university,
      department,
      level,
      semester,
      academic_year: academicYear,
      gpa,
      bio,
      profile_image_url: profileImageUrl,
    });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    logger.info(`Profile updated for user: ${req.userId}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  },
);

// Get user profile
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new AuthenticationError("User not authenticated");
    }

    const profile = await profileRepository.findByUserId(req.userId);
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    res.status(200).json({
      success: true,
      profile,
    });
  },
);

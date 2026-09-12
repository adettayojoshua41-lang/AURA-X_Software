import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import config from "./config";
import logger from "./logger";
import { initializeDatabase } from "./database";
import { errorHandler } from "./errors";
import { router as apiRouter } from "./routes";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = new Set([
  config.frontend.url,
  "http://localhost:5173",
  "http://localhost:5174",
]);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by AURA-X API CORS policy"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api", apiRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
export async function startServer(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();

    // Start listening
    app.listen(config.port, () => {
      logger.info(`✓ Server running on port ${config.port}`);
      logger.info(`✓ Environment: ${config.nodeEnv}`);
      logger.info(`✓ API URL: ${config.api.url}`);
      logger.info(`✓ Frontend URL: ${config.frontend.url}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  process.exit(0);
});

// Handle unhandled errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
  process.exit(1);
});

export default app;

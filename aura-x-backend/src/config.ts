import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export interface Config {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  frontend: {
    url: string;
  };
  api: {
    url: string;
  };
}

const databaseUrl = process.env.DATABASE_URL || "";
const databasePassword = process.env.DB_PASSWORD || "";
const hasExplicitDatabaseConfig = Boolean(
  process.env.DB_HOST ||
  process.env.DB_PORT ||
  process.env.DB_USER ||
  process.env.DB_PASSWORD ||
  process.env.DB_NAME,
);

const config: Config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    // Prefer separate DB_* values so an old DATABASE_URL cannot silently
    // override credentials configured for the local PostgreSQL install.
    url: hasExplicitDatabaseConfig ? "" : databaseUrl,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: databasePassword,
    database: process.env.DB_NAME || "aura_x_db",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRE || "7d",
  },
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:5174",
  },
  api: {
    url: process.env.API_URL || "http://localhost:5000",
  },
};

// Validate required config
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
const missing = requiredEnvVars.filter(
  (envVar) => !process.env[envVar] && envVar !== "DATABASE_URL",
);

if (missing.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missing.join(", ")}`);
}

export default config;

import { Pool, QueryResult, QueryResultRow } from "pg";
import config from "./config";
import logger from "./logger";

// Use DATABASE_URL only when it is explicitly configured. Otherwise use the
// individual DB_* values, which are easier to update for a local PostgreSQL install.
const poolConfig = config.database.url
  ? { connectionString: config.database.url }
  : {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
    };

export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Initialize database
export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    logger.info("✓ Connected to PostgreSQL");

    // Test connection
    const result = await client.query("SELECT NOW()");
    logger.info("Database timestamp:", result.rows[0].now);

    client.release();

    // Run migrations
    await runMigrations();
  } catch (err) {
    logger.error("Failed to connect to database:", err);
    throw err;
  }
}

// Run database migrations
export async function runMigrations() {
  const client = await pool.connect();
  try {
    logger.info("Running database migrations...");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create student_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        university VARCHAR(255),
        department VARCHAR(255),
        level VARCHAR(50),
        semester INTEGER,
        academic_year VARCHAR(10),
        gpa DECIMAL(3,2),
        bio TEXT,
        profile_image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(20),
        name VARCHAR(255) NOT NULL,
        instructor VARCHAR(255),
        credits DECIMAL(3,1),
        semester INTEGER,
        year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create topics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        mastery DECIMAL(3,2) DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        correct_attempts INTEGER DEFAULT 0,
        last_studied TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create exams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        exam_date TIMESTAMP NOT NULL,
        weight DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create exam_topics table (junction table)
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_topics (
        exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
        topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        PRIMARY KEY (exam_id, topic_id)
      );
    `);

    // Create quiz_attempts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        is_correct BOOLEAN NOT NULL,
        mistake_type VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
      CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
      CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);
      CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic_id ON quiz_attempts(topic_id);
    `);

    logger.info("✓ Database migrations completed");
  } catch (err) {
    logger.error("Migration error:", err);
    throw err;
  } finally {
    client.release();
  }
}

// Query helper
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query in ${duration}ms: ${text}`);
    return result;
  } catch (error) {
    logger.error(`Query error: ${text}`, error);
    throw error;
  }
}

export default pool;

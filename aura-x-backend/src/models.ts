import { query } from "./database";
import logger from "./logger";

export interface User {
  id: number;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

export interface UserProfile {
  id: number;
  user_id: number;
  university?: string;
  department?: string;
  level?: string;
  semester?: number;
  academic_year?: string;
  gpa?: number;
  bio?: string;
  profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateProfileInput {
  university?: string;
  department?: string;
  level?: string;
  semester?: number;
  academic_year?: string;
  gpa?: number;
  bio?: string;
  profile_image_url?: string;
}

// User Repository
export const userRepository = {
  async create(input: CreateUserInput & { password: string }): Promise<User> {
    const { email, password, first_name, last_name } = input;

    const result = await query<User>(
      `INSERT INTO users (email, password, first_name, last_name, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, password, first_name, last_name, is_active, created_at, updated_at`,
      [email, password, first_name || null, last_name || null],
    );

    if (result.rows.length === 0) {
      throw new Error("Failed to create user");
    }

    logger.info(`User created: ${email}`);
    return result.rows[0];
  },

  async findById(id: number): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, email, password, first_name, last_name, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id],
    );

    return result.rows[0] || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, email, password, first_name, last_name, is_active, created_at, updated_at
       FROM users WHERE email = $1`,
      [email],
    );

    return result.rows[0] || null;
  },

  async update(id: number, input: UpdateUserInput): Promise<User | null> {
    const { first_name, last_name, is_active } = input;

    const updateFields: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    if (first_name !== undefined) {
      updateFields.push(`first_name = $${paramCount++}`);
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push(`last_name = $${paramCount++}`);
      values.push(last_name);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await query<User>(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = $1
       RETURNING id, email, password, first_name, last_name, is_active, created_at, updated_at`,
      values,
    );

    logger.info(`User updated: ${id}`);
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM users WHERE id = $1`, [id]);

    const deleted = result.rowCount === 1;
    if (deleted) {
      logger.info(`User deleted: ${id}`);
    }
    return deleted;
  },

  async getAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const result = await query<User>(
      `SELECT id, email, password, first_name, last_name, is_active, created_at, updated_at
       FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return result.rows;
  },
};

// Student Profile Repository
export const profileRepository = {
  async create(userId: number): Promise<UserProfile> {
    const result = await query<UserProfile>(
      `INSERT INTO student_profiles (user_id, created_at, updated_at)
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, user_id, university, department, level, semester, academic_year, gpa, bio, profile_image_url, created_at, updated_at`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new Error("Failed to create student profile");
    }

    logger.info(`Student profile created for user: ${userId}`);
    return result.rows[0];
  },

  async findByUserId(userId: number): Promise<UserProfile | null> {
    const result = await query<UserProfile>(
      `SELECT id, user_id, university, department, level, semester, academic_year, gpa, bio, profile_image_url, created_at, updated_at
       FROM student_profiles WHERE user_id = $1`,
      [userId],
    );

    return result.rows[0] || null;
  },

  async update(
    userId: number,
    input: UpdateProfileInput,
  ): Promise<UserProfile | null> {
    const {
      university,
      department,
      level,
      semester,
      academic_year,
      gpa,
      bio,
      profile_image_url,
    } = input;

    const updateFields: string[] = [];
    const values: any[] = [userId];
    let paramCount = 2;

    if (university !== undefined) {
      updateFields.push(`university = $${paramCount++}`);
      values.push(university);
    }
    if (department !== undefined) {
      updateFields.push(`department = $${paramCount++}`);
      values.push(department);
    }
    if (level !== undefined) {
      updateFields.push(`level = $${paramCount++}`);
      values.push(level);
    }
    if (semester !== undefined) {
      updateFields.push(`semester = $${paramCount++}`);
      values.push(semester);
    }
    if (academic_year !== undefined) {
      updateFields.push(`academic_year = $${paramCount++}`);
      values.push(academic_year);
    }
    if (gpa !== undefined) {
      updateFields.push(`gpa = $${paramCount++}`);
      values.push(gpa);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (profile_image_url !== undefined) {
      updateFields.push(`profile_image_url = $${paramCount++}`);
      values.push(profile_image_url);
    }

    if (updateFields.length === 0) {
      return this.findByUserId(userId);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await query<UserProfile>(
      `UPDATE student_profiles SET ${updateFields.join(", ")} WHERE user_id = $1
       RETURNING id, user_id, university, department, level, semester, academic_year, gpa, bio, profile_image_url, created_at, updated_at`,
      values,
    );

    logger.info(`Student profile updated for user: ${userId}`);
    return result.rows[0] || null;
  },
};

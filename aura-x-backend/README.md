# Study Flow AI - Backend API

A TypeScript-based Node.js backend for Study Flow AI providing authentication, user management, and academic data persistence.

## 🏗️ Architecture

```
Backend → PostgreSQL Database
  ↓
REST API
  ├── Authentication (Sign up, Login, JWT)
  ├── User Management (Profile, Settings)
  ├── Academic Data (Courses, Topics, Exams, Attempts)
  └── Analytics & Recommendations
```

## ✨ Features

- ✅ **User Authentication** - JWT-based with password hashing
- ✅ **Student Profiles** - University, department, courses, semester tracking
- ✅ **Academic Data** - Courses, topics, exams, quiz attempts
- ✅ **Type-Safe** - Written in TypeScript for reliability
- ✅ **Validated** - Input validation and error handling
- ✅ **Scalable** - Built on Express.js and PostgreSQL

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create `.env` file**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your PostgreSQL credentials:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/aura_x_db
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=aura_x_user
   DB_PASSWORD=your_secure_password
   DB_NAME=aura_x_db
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   FRONTEND_URL=http://localhost:5174
   NODE_ENV=development
   ```

3. **Create PostgreSQL database** (if not already created)

   ```bash
   createdb aura_x_db
   ```

4. **Run migrations**
   Migrations run automatically on server start

5. **Start development server**

   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:5000`

### Build for Production

```bash
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Authentication

**Sign Up**

```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}

Response: 201 Created
{
  "success": true,
  "user": { ... },
  "accessToken": "eyJhbGc..."
}
```

**Login**

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "success": true,
  "user": { ... },
  "accessToken": "eyJhbGc..."
}
```

**Get Current User**

```
GET /api/auth/me
Authorization: Bearer eyJhbGc...

Response: 200 OK
{
  "success": true,
  "user": { ... },
  "profile": { ... }
}
```

### Profile Management

**Get Profile**

```
GET /api/profile
Authorization: Bearer eyJhbGc...

Response: 200 OK
{
  "success": true,
  "profile": {
    "id": 1,
    "user_id": 1,
    "university": "MIT",
    "department": "Computer Science",
    "level": "Undergraduate",
    "semester": 3,
    ...
  }
}
```

**Update Profile**

```
PUT /api/profile
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "university": "MIT",
  "department": "Computer Science",
  "level": "Undergraduate",
  "semester": 3,
  "academicYear": "2023-2024",
  "gpa": 3.8,
  "bio": "Passionate about learning",
  "profileImageUrl": "https://..."
}

Response: 200 OK
{
  "success": true,
  "profile": { ... }
}
```

### Health Check

```
GET /api/health

Response: 200 OK
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🗄️ Database Schema

### Users Table

- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `first_name`
- `last_name`
- `is_active`
- `created_at`
- `updated_at`

### Student Profiles Table

- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `university`
- `department`
- `level`
- `semester`
- `academic_year`
- `gpa`
- `bio`
- `profile_image_url`
- `created_at`
- `updated_at`

### Courses Table

- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `code`
- `name`
- `instructor`
- `credits`
- `semester`
- `year`
- `created_at`
- `updated_at`

### Topics Table

- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `course_id` (Foreign Key → Courses)
- `name`
- `description`
- `mastery`
- `total_attempts`
- `correct_attempts`
- `last_studied`
- `created_at`
- `updated_at`

### Exams Table

- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `course_id` (Foreign Key → Courses)
- `name`
- `exam_date`
- `weight`
- `created_at`
- `updated_at`

### Quiz Attempts Table

- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `topic_id` (Foreign Key → Topics)
- `is_correct`
- `mistake_type`
- `notes`
- `created_at`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User signs up/logs in → Receives `accessToken`
2. Client includes token in Authorization header: `Authorization: Bearer <token>`
3. Server verifies token on protected endpoints
4. Token expires after 7 days (configurable)

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

## 📝 Error Handling

All errors return JSON with status code and message:

```json
{
  "error": "Email already registered",
  "status": 409
}
```

Common status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth error)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Server Error

## 🛠️ Development

### Project Structure

```
src/
├── index.ts           # Entry point
├── server.ts          # Express app setup
├── config.ts          # Configuration
├── database.ts        # PostgreSQL connection & migrations
├── logger.ts          # Logging utility
├── auth.ts            # Authentication utilities
├── middleware.ts      # Express middleware
├── errors.ts          # Error classes & handler
├── models.ts          # Database models/repositories
├── controllers.ts     # Route handlers
└── routes.ts          # API routes

dist/                  # Compiled JavaScript (generated)
```

### Available Scripts

```bash
npm run dev       # Start with ts-node (hot reload)
npm run build     # Compile TypeScript to JavaScript
npm run start     # Run compiled server
npm run start:prod  # Run in production mode
npm test          # Run tests (placeholder)
```

### Logging

Server uses color-coded logging:

- 🔴 ERROR (red)
- 🟡 WARN (yellow)
- 🟢 INFO (green)
- ⚪ DEBUG (gray)

Set `LOG_LEVEL` in `.env` to control verbosity.

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=<production_db_url>
JWT_SECRET=<long_random_string>
FRONTEND_URL=<production_frontend_url>
PORT=5000
```

### Deploy Steps

1. Build: `npm run build`
2. Install production dependencies: `npm install --production`
3. Run: `npm start`

Or use PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name "aura-x-backend"
pm2 save
pm2 startup
```

## 📚 Next Steps

### Immediate Priorities

1. **Courses API** - Create, read, update, delete courses
2. **Topics API** - Topic management per course
3. **Exams API** - Exam scheduling and tracking
4. **Quiz Attempts API** - Record and analyze attempts

### Medium-term

1. **Study Flow API** - Integrate Study Flow Engine
2. **Recommendations API** - Return personalized study recommendations
3. **Analytics API** - Student progress analytics
4. **Export/Import** - Data backup and restore

### Advanced

1. **Real-time Sync** - WebSocket for live updates
2. **AI Integration** - Connect to Gemini API
3. **File Upload** - Study materials, PDFs, images
4. **Social Features** - Study groups, collaboration

## 🐛 Troubleshooting

### "Cannot connect to database"

- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb aura_x_db`

### "JWT token invalid"

- Ensure JWT_SECRET matches between requests
- Check token hasn't expired
- Token format: `Bearer <token>`

### "Email already registered"

- Use a different email
- Or delete user from database: `DELETE FROM users WHERE email='...';`

## 📖 Documentation

- Express.js: https://expressjs.com
- PostgreSQL: https://www.postgresql.org/docs
- JWT: https://jwt.io
- TypeScript: https://www.typescriptlang.org

## 📄 License

MIT

---

**Status**: ✅ Production Ready for Core Auth & Profiles
**Last Updated**: 2024-01-15

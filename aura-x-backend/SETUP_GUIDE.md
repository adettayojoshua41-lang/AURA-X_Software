# Study Flow AI Backend - Setup & Development Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [PostgreSQL Installation](#postgresql-installation)
4. [Database Configuration](#database-configuration)
5. [Running the Backend](#running-the-backend)
6. [Testing the API](#testing-the-api)
7. [Common Issues](#common-issues)
8. [Frontend Integration](#frontend-integration)

---

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **PostgreSQL**: v12 or higher
- **Git**: For version control
- **Postman** or **curl**: For testing API endpoints

Check installed versions:

```bash
node --version
npm --version
postgres --version
```

---

## Local Development Setup

### 1. Clone/Access the Backend

```bash
cd aura-x-backend
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`:

- **express**: Web framework
- **pg**: PostgreSQL client
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cors**: Cross-origin requests
- **dotenv**: Environment variable management
- **TypeScript & ts-node**: Development

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your local PostgreSQL credentials:

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/aura_x_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=aura_x_db

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d

# URLs
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5174

# Logging
LOG_LEVEL=debug
```

> **Security**: Change `JWT_SECRET` to a random string in production!

---

## PostgreSQL Installation

### Windows

1. **Download PostgreSQL**
   - Visit https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16

2. **Run Installer**
   - Double-click the installer
   - Choose installation directory
   - Password for `postgres` user (remember this!)
   - Default port 5432
   - Click through and finish

3. **Verify Installation**

   ```bash
   psql --version
   psql -U postgres
   ```

   This should connect you to PostgreSQL interactive shell

### macOS

```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or download from: https://www.postgresql.org/download/macosx/
```

### Linux (Ubuntu)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo su - postgres
psql
```

---

## Database Configuration

### 1. Create Database User (Optional)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create user
CREATE USER aura_x_user WITH PASSWORD 'your_secure_password';

# Grant privileges
ALTER ROLE aura_x_user CREATEDB;

# Exit
\q
```

### 2. Create Database

```bash
# Connect as postgres
psql -U postgres

# Create database
CREATE DATABASE aura_x_db OWNER aura_x_user;

# Exit
\q
```

Or use command line:

```bash
createdb -U postgres aura_x_db
```

### 3. Verify Connection

```bash
psql -U aura_x_user -d aura_x_db -h localhost
```

If successful, you'll see: `aura_x_db=>`

---

## Running the Backend

### Development Mode

Start the server with hot-reload (recommended for development):

```bash
npm run dev
```

Expected output:

```
[timestamp] [INFO] ✓ Connected to PostgreSQL
[timestamp] [INFO] Running database migrations...
[timestamp] [INFO] ✓ Database migrations completed
[timestamp] [INFO] ✓ Server running on port 5000
[timestamp] [INFO] ✓ Environment: development
[timestamp] [INFO] ✓ API URL: http://localhost:5000
[timestamp] [INFO] ✓ Frontend URL: http://localhost:5174
```

The server is now running at `http://localhost:5000`

### Production Build

```bash
# Compile TypeScript
npm run build

# Start compiled server
npm start

# Or run in production mode
npm run start:prod
```

---

## Testing the API

### 1. Using curl

**Sign Up**

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecurePass123"
  }'
```

**Get Current User** (replace TOKEN with actual token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### 2. Using Postman

1. **Open Postman**
2. **Create New Collection**: "Study Flow API"
3. **Create Requests**:

**Request 1: Sign Up**

- Method: `POST`
- URL: `http://localhost:5000/api/auth/signup`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "email": "student@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- Click Send → Should get `201 Created`

**Request 2: Login**

- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "email": "student@example.com",
    "password": "SecurePass123"
  }
  ```
- Click Send → Copy the `accessToken` from response

**Request 3: Get Profile**

- Method: `GET`
- URL: `http://localhost:5000/api/profile`
- Headers: `Authorization: Bearer PASTE_TOKEN_HERE`
- Click Send → Should return empty profile (will update it next)

**Request 4: Update Profile**

- Method: `PUT`
- URL: `http://localhost:5000/api/profile`
- Headers:
  - `Authorization: Bearer PASTE_TOKEN_HERE`
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "university": "MIT",
    "department": "Computer Science",
    "level": "Undergraduate",
    "semester": 3,
    "academicYear": "2023-2024",
    "gpa": 3.85,
    "bio": "Passionate about learning and technology"
  }
  ```
- Click Send → Should return updated profile

### 3. Health Check

```bash
curl http://localhost:5000/api/health
```

Response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Common Issues

### Issue: "Cannot find module 'pg'"

**Solution**: Install dependencies

```bash
npm install
```

### Issue: "ECONNREFUSED - Connection refused"

**Solution**: PostgreSQL not running

```bash
# Windows
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Issue: "password authentication failed"

**Solution**: Check credentials in `.env`

- Ensure DB_USER and DB_PASSWORD match PostgreSQL user
- Verify database exists: `psql -l`
- Reset password: `ALTER USER username WITH PASSWORD 'newpassword';`

### Issue: "Database does not exist"

**Solution**: Create database

```bash
createdb -U postgres aura_x_db
```

### Issue: "Port 5000 already in use"

**Solution**: Change PORT in `.env` or kill process

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Issue: TypeScript compilation errors

**Solution**: Rebuild

```bash
npm run build
```

---

## Frontend Integration

### Connect Frontend to Backend

In `src/api.js` (or create this file in frontend):

```javascript
const API_URL = "http://localhost:5000/api";

export async function signup(email, password, firstName, lastName) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  return response.json();
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (data.accessToken) {
    localStorage.setItem("token", data.accessToken);
  }
  return data;
}

export async function getProfile() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

export async function updateProfile(profileData) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return response.json();
}
```

### Update React Context

In `src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useState, useCallback } from "react";
import * as API from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = useCallback(async (email, password, firstName, lastName) => {
    setLoading(true);
    setError(null);
    try {
      const result = await API.signup(email, password, firstName, lastName);
      if (result.accessToken) {
        setUser(result.user);
        return result;
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Signup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await API.login(email, password);
      if (result.accessToken) {
        setUser(result.user);
        return result;
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

---

## Next Steps

### Immediate

1. ✅ Run backend locally: `npm run dev`
2. ✅ Test endpoints with curl or Postman
3. ✅ Integrate API calls into frontend
4. ✅ Test signup/login flow

### Short-term

1. Build Courses API
2. Build Topics API
3. Build Exams API
4. Build Quiz Attempts API

### Medium-term

1. Integrate Study Flow Engine
2. Build Analytics endpoints
3. Add file upload for study materials
4. Build recommendations endpoint

---

## Useful PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d aura_x_db

# Inside psql prompt (\q to exit)
\dt                    # List all tables
\d users               # Describe users table
\l                     # List all databases
\du                    # List all users

# Query examples
SELECT * FROM users;
SELECT * FROM student_profiles;
DELETE FROM users WHERE email='test@example.com';
DROP DATABASE aura_x_db;
```

---

## Debugging Tips

### Enable Debug Logging

In `.env`:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Check Network Requests

Use browser DevTools → Network tab to see:

- Request URL
- Request headers (especially Authorization)
- Response status
- Response body

### Check Database

```bash
psql -U postgres -d aura_x_db
SELECT * FROM users;
SELECT * FROM student_profiles WHERE user_id=1;
SELECT * FROM quiz_attempts WHERE user_id=1 LIMIT 5;
```

---

## Production Deployment Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Use environment-specific DATABASE_URL
- [ ] Enable HTTPS (add SSL cert paths)
- [ ] Set secure CORS origin (not \*)
- [ ] Enable database backups
- [ ] Configure logging to file or service
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Use process manager (PM2, etc.)

---

## Resources

- Express.js: https://expressjs.com
- PostgreSQL Docs: https://www.postgresql.org/docs
- JWT.io: https://jwt.io
- TypeScript: https://www.typescriptlang.org
- Node.js: https://nodejs.org

---

**Status**: ✅ Ready for Development
**Last Updated**: 2024-01-15

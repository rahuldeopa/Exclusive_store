# Media Backend

A production-ready Node.js backend for a private, passcode-gated media application.

## Tech Stack
- Node.js
- TypeScript
- Express
- dotenv
- cors
- zod (validation)
- Prisma ORM
- PostgreSQL

## Folder Structure
```
src/
 ├─ app.ts
 ├─ server.ts
 ├─ config/
 │   ├─ env.ts
 │   ├─ db.ts
 │   └─ index.ts
 ├─ routes/
 │   └─ auth.routes.ts
 ├─ controllers/
 │   └─ auth.controller.ts
 ├─ services/
 │   └─ auth.service.ts
 ├─ middlewares/
 │   ├─ error.middleware.ts
 │   └─ validate.middleware.ts
 ├─ utils/
 │   └─ response.util.ts
 └─ types/
     └─ index.d.ts
```

## Setup Instructions

### 1. Install dependencies
```
cd backend
npm install
```

### 2. Configure Environment Variables
- Copy `.env.example` to `.env` and fill in your values.

### 3. Set up the Database
- Ensure your PostgreSQL instance is running and accessible.
- Update `DATABASE_URL` in `.env`.
- Run Prisma migrations:
```
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client
```
npx prisma generate
```

### 5. Start the Development Server
```
npm run dev
```

Server runs on the port specified in `.env` (default: 4000).

## API Example
### POST /api/auth/verify
**Body:**
```
{
  "passcode": "your-code"
}
```
**Response:**
- 200: `{ success: true, message: 'Passcode verified', data: { valid: true, source: 'db'|'env' } }`
- 401: `{ success: false, message: 'Invalid or expired passcode' }`

## Notes
- Prisma client is a singleton for safe usage.
- Centralized error handling and validation.
- Ready for deployment on Render/Railway.
- Easily extensible for users, logs, analytics, etc.

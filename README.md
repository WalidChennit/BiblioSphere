# BiblioSphere

Library management platform with role-based dashboards for **students**, **staff (personnel)**, and **admin**.

- **Backend**: NestJS + Prisma + PostgreSQL, Swagger docs, cookie-based JWT session
- **Frontend**: Next.js (App Router) + Tailwind + shadcn/ui, protected routes via middleware

---

## Monorepo Structure

- `backend/` — NestJS API (runs on `http://127.0.0.1:3001`)
- `frontend/` — Next.js web app (runs on `http://localhost:3000`)

---

## Features

### Auth & Roles

- Cookie-based session (`session` httpOnly cookie)
- Roles:
  - `etudiant` → `/student/*`
  - `personnel` → `/personal/*`
  - `admin` → `/admin/*`
- Frontend middleware validates the session and role by calling `GET /auth/me`.

### Core Library Operations

- Books/catalog: create/list/update books (includes cover upload)
- Reservations: queueing + “available” state, pickup flow → creates a borrow
- Borrows (`Emprunt`): due date tracking, renewals, return flow

### Notifications (In-app)

DB-backed in-app notifications (bell dropdown) with:

- **Students**
  - New book added
  - Reservation time arrived / ready for pickup
  - Borrow due in 1 day
- **Personnel**
  - Student reserved a book
  - Student borrowed a book
  - Author added
  - Reservation pickup deadline reached
  - Borrow due date reached
- **Admin**
  - New book added
  - New user registered

Notifications are deduped via `dedupeKey` to avoid cron/event duplicates.

**User notification preferences** are stored per user and affect what shows in the bell dropdown.

---

## Requirements

- Node.js (recommended: latest LTS)
- PostgreSQL
- (Optional) Prisma CLI via `npx prisma`

---

## Environment Variables

This repo does not ship `.env` templates—create the following files locally.

### Backend (`backend/.env`)

Required:

- `DATABASE_URL` — PostgreSQL connection string, e.g.
  - `postgresql://USER:PASSWORD@localhost:5432/bibliosphere?schema=public`

Recommended:

- `JWT_SECRET` — secret for JWT signing/verification (use a strong random value)
- `NODE_ENV` — `development` or `production`

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_BASE_URL` — defaults to `http://localhost:3001` if not set

---

## Setup (Local)

### 1) Backend

```bash
cd backend
npm install

# Prisma: apply migrations and generate client
npx prisma migrate dev

# start API (watch)
npm run start:dev
```

Backend runs at:

- API: `http://127.0.0.1:3001`
- Swagger: `http://127.0.0.1:3001/api`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Key API Endpoints

### Auth

- `POST /auth/login` — sets the `session` cookie
- `POST /auth/logout` — clears the `session` cookie
- `GET /auth/me` — returns session user (or `null`)

### Users

- `PATCH /users/me` — update profile fields
- `PATCH /users/me/password` — change password
- `GET /users/me/notification-prefs` — get in-app notification preferences
- `PATCH /users/me/notification-prefs` — update in-app notification preferences

### Notifications

- `GET /notifications` — list notifications (supports `?unreadOnly=1&limit=10`)
- `POST /notifications/:id/read` — mark one notification read
- `POST /notifications/read-all` — mark all read

### Uploads

- `POST /uploads/cover` — multipart upload field: `file`
  - Response includes `imageUrl` like `/public/uploads/<filename>`

Static files are served under `http://127.0.0.1:3001/public/*`.

---

## Scripts

### Backend (`backend/`)

- `npm run start:dev` — start API in watch mode
- `npm run build` — build
- `npm run test` — unit tests

### Frontend (`frontend/`)

- `npm run dev` — start Next dev server
- `npm run build` — production build

---

## Notes / Troubleshooting

- If you see CORS issues, confirm the frontend origin is `http://localhost:3000`.
- If notifications or profile pages behave oddly after Prisma schema changes, rerun:
  - `cd backend && npx prisma generate`
- This repo currently contains multiple lockfiles (root and frontend). For consistency, prefer using `npm` inside `backend/` and `frontend/`.

---

## License

Private / internal project (no public license specified).

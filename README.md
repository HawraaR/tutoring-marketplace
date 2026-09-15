# 🎓 Tutorium — Peer-to-Peer Academic Tutoring Marketplace

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

## 📖 Overview

**Tutorium** is a full-stack, real-time peer tutoring marketplace built for university students. It connects students who need course-specific academic support with high-achieving peer tutors who have recently excelled in those same subjects.

The platform runs on a unified multi-role architecture: a single account can learn, teach, and manage bookings without switching logins. It includes custom availability management, conflict-free scheduling, live WebSocket chat, verified reviews, certificate uploads, and an administrative moderation portal.

---

## ✨ Core Features

### 🔄 Unified Multi-Role Architecture & RBAC
- **Single identity, multiple roles** — one account can act as a **Student**, an approved **Tutor**, and/or an **Admin**.
- **Dynamic role switcher** — dual-role users can toggle their active role instantly from the header, with no need to log out.
- **Dedicated sub-profiles** — a separate `StudentProfile` (goals, major, budget, learning style) and `TutorProfile` (headline, hourly rate, certificates, video intro, rating metrics) per role.

### 🔍 Tutor Discovery & Search Directory
- **Multi-parameter filtering** — search tutors by name, subject, category, hourly rate range, minimum rating, and spoken languages.
- **Rich tutor profiles** — qualifications, education, verified badges, past student reviews, video introductions, and virtual classroom links (Google Meet / Zoom), all in one view.

### 📅 Custom Interactive Calendar & Booking Engine
- **Purpose-built scheduling grid** — a custom weekly/monthly calendar built for performance, with no bloated external calendar dependency.
- **Tutor slot management** — tutors publish, edit, and remove availability slots, with built-in chronological validation (`endTime > startTime`).
- **Student booking flow** — students browse tutor availability, pick a course subject, and book a slot with automatic conflict resolution.
- **Self-booking protection** — dual-role users are blocked from booking their own availability slots.

### 💬 Real-Time Messaging & Chat (Socket.io)
- **Instant communication** — two-way real-time messaging between students and tutors, backed by room-based authorization.
- **Conversation hub** — unread message badges, participant presence, historical message loading, and file/attachment handling.
- **Security & integrity** — sockets verify JWT tokens on handshake and check conversation membership against the database before any message is dispatched.

### 🎥 Session Lifecycle Management
- **Status tracking** — sessions move through `PENDING`, `CONFIRMED`, `COMPLETED`, and `CANCELLED` states.
- **Virtual meeting integration** — one-click access to the tutor's meeting link (Google Meet, Zoom) on confirmed bookings.
- **Session history** — a full archive of completed sessions for both students and tutors.

### ⭐ Ratings & Verified Reviews
- **Post-session feedback** — verified students can rate tutors 1–5 stars and leave written feedback after a completed session.
- **Live metric aggregation** — a tutor's average rating and review count update in real time as new reviews come in.

### 🎓 Tutor Application & Verification Workflow
- **Application portal** (`/become-a-tutor`) — students apply to tutor by submitting a headline, bio, hourly rate, and subjects taught, along with verified certification documents via Multer and Supabase.
- **Admin verification portal** (`/admin/tutor-approvals`) — admins review submitted credentials and approve or reject applications with custom feedback.

### 📊 Personalized Dashboards
- **Student dashboard** — total learning hours, active bookings, subject breakdown, spending, and upcoming sessions.
- **Tutor dashboard** — total earnings, hours taught, active student count, performance charts, availability summary, and recent reviews.
- **Admin control center** — platform-wide user metrics, role promotion/demotion, tutor application moderation, and subject catalog management.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Real-time client**: [Socket.io Client](https://socket.io/docs/v4/client-api/)
- **HTTP client**: [Axios](https://axios-http.com/), with JWT request interceptors and automatic FormData boundaries
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+ recommended)
- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/), run via [`tsx`](https://github.com/privatenumber/tsx) and compiled with `tsc`
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM 7](https://www.prisma.io/) (via the `@prisma/adapter-pg` connection pool)
- **Real-time server**: [Socket.io](https://socket.io/)
- **File storage**: [Supabase Storage](https://supabase.com/storage) / [Multer](https://github.com/expressjs/multer)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Validation**: [Zod](https://zod.dev/) request body schemas

---

## 🏗️ Project Architecture

```text
tutoring-marketplace/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (User, Tutor, Booking, Message, etc.)
│   │   ├── seedData.ts            # Seed script with mock peer tutors, students & sessions
│   │   └── seedMessages.ts        # Seed script for chat history
│   ├── src/
│   │   ├── controllers/           # Request handlers (Auth, Tutor, Booking, Chat, etc.)
│   │   ├── middlewares/           # JWT auth, Admin guard, Multer upload, Zod validate
│   │   ├── routes/                # Express REST API route definitions
│   │   ├── schemas/                # Zod validation schemas
│   │   ├── db.ts                  # Prisma Client with pg pool adapter
│   │   ├── server.ts              # Express app bootstrap & HTTP/Socket server init
│   │   ├── socket.ts              # Socket.io handlers & room logic
│   │   └── supabase.ts            # Supabase client for storage
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                   # Modular API service clients (Axios instance + endpoints)
│   │   ├── components/            # Reusable UI components
│   │   │   ├── admin/             # Admin approval cards & application tables
│   │   │   ├── dashboard/         # Stat cards & trend charts
│   │   │   ├── directory/         # Tutor cards, filters, and booking modals
│   │   │   ├── layout/            # Navbar, Header, Sidebar, Footer
│   │   │   ├── messages/          # Conversation lists, chat windows, message bubbles
│   │   │   └── review/            # Star rating inputs and review modals
│   │   ├── context/               # AuthContext & AuthProvider (session & role switcher)
│   │   ├── hooks/                 # Custom React hooks (useDashboard, etc.)
│   │   ├── layouts/               # AppLayout (with Sidebar & Header) and AuthLayout
│   │   ├── pages/                 # Route pages (Directory, Calendar, Messages, Dashboards)
│   │   ├── types/                 # Shared TypeScript interfaces
│   │   ├── App.tsx                # Main routing table & role-protected routes
│   │   └── main.tsx               # DOM mount point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🗄️ Database Schema Summary

| Model | Description |
| :--- | :--- |
| **`User`** | Central identity record with email, hashed password, and role flags (`isStudent`, `isTutor`, `isAdmin`). |
| **`TutorProfile`** | 1-to-1 extension of `User` holding bio, rate, meeting URL, `TutorStatus` (`PENDING`, `APPROVED`, `REJECTED`), certificates, and review averages. |
| **`StudentProfile`** | 1-to-1 extension of `User` storing major, education level, learning goals, and budget. |
| **`Subject`** | Catalog of academic subjects (e.g., Data Structures, Web Development, Databases). |
| **`TutorSubject`** | Junction table mapping tutors to the subjects they teach. |
| **`AvailabilitySlot`** | Time blocks published by tutors, with `startTime`, `endTime`, and `isBooked` status. |
| **`Booking`** | A scheduled tutoring session linking student, tutor, subject, time window, status, and price. |
| **`Conversation`** | Chat thread metadata and participant grouping. |
| **`ConversationParticipant`** | Junction linking users to conversations, with `lastReadAt` tracking. |
| **`Message`** | Real-time messages with sender reference, text content, attachments, and soft deletion. |
| **`Review`** | Post-session evaluation with a numerical rating (1–5) and written feedback, linked to a `Booking`. |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A running [PostgreSQL](https://www.postgresql.org/) database (local, or hosted via [Supabase](https://supabase.com/))

---

### 1. Clone the repository
```bash
git clone https://github.com/HawraaR/tutoring-marketplace.git
cd tutoring-marketplace
```

---

### 2. Backend setup

**Install dependencies:**
```bash
cd backend
npm install
```

**Configure environment variables:**
Create a `.env` file in `backend/` using the template below:
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/tutoring_db?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/tutoring_db"

# Authentication secret
JWT_SECRET="your_super_secret_jwt_key_here"

# Supabase Storage (for tutor certificates and attachments)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

**Sync the database schema and generate the Prisma client:**
```bash
npx prisma generate
npx prisma db push
```

**Seed the database with demo data** (verified tutors, students, subjects, availability slots, past bookings, and chat threads):
```bash
npx prisma db seed      # Seeds users, profiles, subjects, sessions & reviews
npm run seed:messages   # Optional: seeds sample chat threads
```

**Start the backend server:**
```bash
npm run dev
```
The API and Socket.io service will be available at `http://localhost:5000`.

---

### 3. Frontend setup

**Install dependencies** (in a new terminal):
```bash
cd frontend
npm install
```

**Configure environment variables** (optional, only if pointing to a custom API URL):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Start the development server:**
```bash
npm run dev
```
The app will be live at `http://localhost:5173`.

---

## 🔑 Demo Accounts (Pre-Seeded)

All demo accounts share the default password: **`Password123!`**

| Email | Role | Notes |
| :--- | :--- | :--- |
| `admin@tutormarketplace.com` | **Admin** | System metrics, user management, tutor application review portal |
| `alex.tutor@example.com` | **Tutor** | Approved tutor for Web Dev (MERN) & DSA, with availability slots and a 5.0 rating |
| `sarah.math@example.com` | **Tutor** | Approved tutor for Database Systems & Algorithms, 5.0 rating |
| `nour.dual@example.com` | **Dual role** | Both Student & Tutor — Backend Engineering peer mentor with dynamic role toggle |
| `maya.student@example.com` | **Student** | Active student with upcoming bookings and past reviews |
| `liam.student@example.com` | **Student** | Active student account |

---

## 🔌 API Reference

### 🛡️ Authentication — `/api/auth`
- `POST /api/auth/register` — Register a new account (student by default).
- `POST /api/auth/login` — Authenticate and receive a JWT.
- `GET /api/auth/me` — Retrieve the currently authenticated user and profile state.

### 🧑‍🏫 Tutors & Applications — `/api/tutors`
- `GET /api/tutors` — List approved tutors, filterable by `subject`, `search`, `minRating`, `maxPrice`.
- `GET /api/tutors/:id` — Get a detailed tutor profile, qualifications, and past reviews.
- `POST /api/tutors/apply` — Submit an application to become a tutor (supports certificate upload).
- `GET /api/tutors/me` / `PATCH /api/tutors/me` — View or update the authenticated tutor's profile.
- `GET /api/tutors/applications` — *(Admin)* View pending tutor applications.
- `PATCH /api/tutors/applications/:id` — *(Admin)* Approve or reject a tutor application.

### 📅 Availability & Scheduling — `/api/availability`
- `GET /api/availability` — Retrieve all availability slots.
- `GET /api/availability/open` — Get all unbooked slots across tutors.
- `GET /api/availability/tutor/:tutorId` — Get availability slots for a specific tutor.
- `POST /api/availability` — *(Tutors)* Create a new availability slot.
- `PUT /api/availability/:slotId` — *(Tutors)* Update a slot's time window.
- `DELETE /api/availability/:slotId` — *(Tutors)* Remove an availability slot.

### 📑 Bookings & Sessions — `/api/bookings`
- `POST /api/bookings` — Create a new session booking for an available slot.
- `GET /api/bookings/user` — Get all bookings for the logged-in student.
- `GET /api/bookings/tutor` — Get all bookings for the logged-in tutor.
- `PATCH /api/bookings/:bookingId/status` — Update a session's status (`CONFIRMED`, `CANCELLED`, `COMPLETED`).
- `DELETE /api/bookings/:bookingId` — Delete or cancel a booking.

### 💬 Real-Time Messaging — `/api`
- `GET /api/conversations` — Fetch all conversations for the authenticated user.
- `POST /api/conversations` — Create or retrieve an existing conversation with another user.
- `GET /api/conversations/:conversationId/messages` — Retrieve paginated messages for a conversation.
- `POST /api/conversations/:conversationId/messages` — Send a message in a conversation.
- `PATCH /api/conversations/:conversationId/read` — Mark all messages in a conversation as read.
- `DELETE /api/messages/:messageId` — Soft-delete a message.

### ⭐ Reviews — `/api/reviews`
- `POST /api/reviews` — Submit a rating (1–5) and feedback for a completed booking.

### 👥 Admin & User Management — `/api/admin` & `/api/users`
- `GET /api/users` — List all platform users.
- `PATCH /api/users/:id/roles` — Update a user's roles (`isStudent`, `isTutor`, `isAdmin`).
- `GET /api/admin/tutors/pending` — List pending tutor applications for verification.

---

## ⚡ Socket.io Real-Time Events

| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `connection` | Client → Server | Handshake auth (`{ token }`) | Authenticates the socket via JWT and joins the user's personal room. |
| `join_conversation` | Client → Server | `{ conversationId }` | Authorizes membership and joins the conversation room. |
| `leave_conversation` | Client → Server | `{ conversationId }` | Leaves the active conversation room. |
| `send_message` | Client → Server | `{ conversationId, message }` | Broadcasts a message to the room and to each participant's personal room. |
| `receive_message` | Server → Client | `MessagePayload` | Delivers a newly sent message in real time. |

---

## 🛡️ Security Highlights

- **Token-based authentication** — JWTs are generated securely, with strict verification of request headers.
- **Role-based access control (RBAC)** — protected routes on both the frontend (React Router) and backend (`authenticateToken`, `requireAdmin` middleware).
- **Input validation** — strict Zod schemas validate request bodies before controllers touch the database.
- **SQL injection prevention** — Prisma ORM uses parameterized queries throughout the data layer.
- **Secure file storage** — certificate uploads go through Multer and are stored in private Supabase Storage buckets.

---


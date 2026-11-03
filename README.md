# Planno — Modern Full-Stack Project Management

Planno is a full-stack project management application built for team collaboration, task tracking, and automated email reminders. It uses Clerk for multi-tenant organization authentication, Inngest for asynchronous background jobs and database synchronization, and Neon PostgreSQL managed with Prisma ORM.

---

## Architecture Overview

```text
                 ┌──────────────────────┐
                 │    React Client      │
                 │   (Vite + Tailwind)  │
                 └──────────┬───────────┘
                            │ Session Auth / Organization UI
                            ▼
                 ┌──────────────────────┐
                 │      Clerk Auth      │
                 └──────────┬───────────┘
                            │ Webhook Events (user/org lifecycle)
                            ▼
                 ┌──────────────────────┐
                 │    Inngest Cloud     │
                 └──────────┬───────────┘
                            │ Serves step functions via /api/inngest
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express Backend                        │
│                   (Node.js on Vercel)                       │
│                                                             │
│  ┌─────────────────────────┐   ┌─────────────────────────┐  │
│  │   Protected REST API    │   │  Inngest Background     │  │
│  │ (/api/workspaces, etc.) │   │  Workers & Event Steps  │  │
│  └────────────┬────────────┘   └────────────┬────────────┘  │
└───────────────┼─────────────────────────────┼───────────────┘
                │                             │
                ▼                             ▼
       ┌──────────────────┐          ┌──────────────────┐
       │  Neon Postgres   │          │    Nodemailer    │
       │  (Prisma ORM)    │          │  (Task Reminders)│
       └──────────────────┘          └──────────────────┘
```

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, @clerk/clerk-react, Lucide React
- **Backend:** Node.js, Express.js, @clerk/express, Inngest (v3.54+), Nodemailer
- **Database:** Neon Serverless PostgreSQL with Prisma ORM
- **Event Orchestration:** Inngest Cloud
- **Hosting:** Vercel

## Repository Structure

```text
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # UI components (Task cards, Workspace modals)
│   │   ├── pages/          # App views (Dashboard, Workspace, Settings)
│   │   └── App.jsx         # App router and Clerk auth provider wrapper
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express API & Inngest serverless handlers
│   ├── configs/            # Prisma client and Nodemailer transporter
│   ├── inngest/            # Event-driven functions (Clerk sync & email jobs)
│   ├── middlewares/        # Clerk authentication guard middleware
│   ├── routes/             # Express API route declarations
│   ├── prisma/             # Prisma schema & migrations
│   ├── server.js           # Server entry point
│   ├── vercel.json         # Serverless rewrite configuration
│   └── package.json
│
└── README.md
```

## Getting Started (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/xyrois/Planno.git
cd Planno
```

### 2. Configure Environment Variables

Create `.env` files in both `client/` and `server/` using the templates documented in their respective directories.

### 3. Set Up and Start the Backend

```bash
cd server
npm install
npx prisma generate
npm run dev
```

### 4. Set Up and Start the Frontend

In a new terminal window:

```bash
cd client
npm install
npm run dev
```

## Deployment (Vercel)

1. Deploy `client/` and `server/` as separate projects on Vercel.
2. Add all required environment variables to each project's settings dashboard.
3. Open Inngest Cloud and sync your production backend endpoint:

```text
https://<your-backend-domain>.vercel.app/api/inngest
```
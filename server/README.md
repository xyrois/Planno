# Planno Backend API & Event Service

The backend service for Planno. Runs an Express application on Vercel handling protected CRUD endpoints for workspaces, projects, and tasks, alongside an Inngest background event processor for database synchronization and task reminder emails.

---

## Environment Variables

Create a `.env` file in the `server` directory:

```ini
PORT=5000

# PostgreSQL Connection String (Neon)
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require"

# Clerk Backend Configuration
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# Inngest Cloud Keys
INNGEST_APP_ID="my-app"
INNGEST_SIGNING_KEY="signkey-prod-..."
INNGEST_EVENT_KEY="innkey-..."

# Nodemailer / SMTP Credentials
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-app-specific-password"
```

## Inngest Function Index

All functions are served via `serve({ client: inngest, functions })` mounted at `/api/inngest`.

| Function ID | Trigger Event | Description |
|---|---|---|
| `sync-user-from-clerk` | `clerk/user.created` | Inserts new user profile row into Neon User table |
| `update-user-with-clerk` | `clerk/user.updated` | Updates existing record in User table |
| `delete-user-with-clerk` | `clerk/user.deleted` | Removes user row from User table |
| `sync-workspace-from-clerk` | `clerk/organization.created` | Creates Workspace row and assigns creator as ADMIN |
| `update-workspace-from-clerk` | `clerk/organization.updated` | Updates workspace metadata (name, slug, image_url) |
| `delete-workspace-from-clerk` | `clerk/organization.deleted` | Deletes workspace record and cascading relations |
| `sync-workspace-member-from-clerk` | `clerk/organizationInvitation.accepted` | Inserts WorkspaceMember entry with accepted role |
| `send-task-assignment-email` | `app/task.assigned` | Sends assignment email and schedules a reminder before due_date |

## API Endpoints

All data routes require a Bearer token via Clerk authentication (`protect` middleware).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `ALL` | `/api/inngest` | Inngest executor registration and function runner |
| `GET`, `POST` | `/api/workspaces` | Manage workspaces |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/projects` | Manage workspace projects |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/tasks` | Manage project tasks |
| `GET`, `POST`, `DELETE` | `/api/comments` | Manage task discussion threads |

## Database Management

Prisma handles database migrations and schema updates.

### Push Schema Changes to Neon

```bash
npx prisma db push
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Open Visual Database Studio

```bash
npx prisma studio
```
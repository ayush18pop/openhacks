# OpenHacks Backend Setup

## Env variables

Copy `.env.example` to `.env.local` and fill:

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- DATABASE_URL (Azure SQL / SQL Server connection string)
- MONGODB_URI
- MONGODB_DB
- Optional: CLERK_WEBHOOK_SECRET, NEXT_PUBLIC_APP_URL, AZURE_STORAGE_CONNECTION_STRING

## Install & generate

- Install deps
- Generate Prisma Client
- Push schema to Azure SQL

## API routes

- POST /api/events (organizer only)
- GET /api/events
- POST /api/registrations
- GET /api/registrations?eventId=...
- POST /api/teams, PUT /api/teams
- POST /api/submissions, GET /api/submissions?eventId=...
- POST /api/announcements, GET /api/announcements?eventId=...
- POST /api/rounds, GET /api/rounds?eventId=...
- POST /api/scores, GET /api/scores?submissionId=...

## Clerk pages

- /sign-in and /sign-up are available. Wrap UI with SignedIn, SignedOut from @clerk/nextjs as needed.

## Notes

- SQL Server lacks JSON/array types; Event.tracksJson stores JSON string.
- MongoDB holds submissions/announcements for flexibility and scale.

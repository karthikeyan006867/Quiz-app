# School Quiz App (Next.js + Prisma + Neon)

A modern school quiz platform with:
- No student login required
- Multiple teachers with separate passwords
- Each teacher has their own dashboard and can create multiple tests
- Published tests visible to students for direct attendance
- Persistent database storage using Neon Postgres + Prisma
- Vercel-ready deployment

## Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma ORM
- Neon PostgreSQL

## Features

### Teacher side
- Add teacher with name, subject, and unique password
- Teacher-specific login (`/teacher/[slug]/login`)
- Teacher dashboard (`/teacher/[slug]/dashboard`)
- Create tests with multiple questions/options and correct answers
- Publish / unpublish tests
- Track attempts count per test

### Student side
- View all published tests from homepage
- Attend a test without login
- Start by entering name only
- Timer-based quiz attempt
- Instant score on submission

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Setup environment variables:

```bash
cp .env.example .env
```

3. Put your Neon connection string in `.env` as `DATABASE_URL`.

4. Generate Prisma client and sync schema:

```bash
npm run prisma:generate
npm run prisma:push
```

5. Run app:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Neon Setup

1. Create a Neon project/database.
2. Copy connection string.
3. Set it as `DATABASE_URL` in `.env` (local) and Vercel environment variables (production).

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add `DATABASE_URL` environment variable in Vercel project settings.
4. Deploy.

Build scripts already include Prisma client generation (`postinstall`).

## Important Routes

- `/` → Home + published tests
- `/teacher/new` → Add teacher
- `/teacher/[slug]/login` → Teacher login
- `/teacher/[slug]/dashboard` → Teacher test management
- `/test/[id]` → Student test page
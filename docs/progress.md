# Progress

What has been done in this project, in order, and notes worth keeping.

## Setup

- [x] Project created with `npx create-next-app@latest untai`
  - Next.js 16.3.6, React 19.2.8, TypeScript, Tailwind CSS v4, ESLint, App Router (`app/`)
- [x] `CLAUDE.md` created, adjusted to `docs/app-flow.md`
- [x] Writing rule added to `CLAUDE.md`: no em dash or similar machine-looking marks, no hard wrapping, plain human language, no filler, for every piece of text in the project
- [x] Better Auth and Drizzle installed, both in the root (`D:\git\untai`), since this is one Next.js project with no separate backend folder.

  Better Auth: https://better-auth.com/docs/installation

  ```powershell
  npm install better-auth
  ```

  Drizzle with Neon: https://orm.drizzle.team/docs/get-started/neon-new

  ```powershell
  npm i drizzle-orm@rc @neondatabase/serverless dotenv
  npm i -D drizzle-kit@rc tsx
  ```
- [x] Drizzle connected to Neon in `lib/db.ts` (Step 3 of the Drizzle guide, using the pooled `DATABASE_URL`). In `lib/` instead of the guide's `src/`, because this project has no `src/` and keeps shared code in root folders next to `app/`.
- [x] Better Auth config in `lib/auth.ts`: Drizzle adapter (Relations v2, because Drizzle is the rc version), email and password login, extra `user` fields `role` (`member` or `admin`, default `member`, required so the column is never NULL, not settable by the user; register only creates members, admins come from the seeder) and `bio`. https://better-auth.com/docs/installation, https://better-auth.com/docs/concepts/database
- [x] `@better-auth/drizzle-adapter` not installed separately: `better-auth` already depends on it, and `lib/auth.ts` imports `/relations-v2` from that copy.
- [x] `.gitignore` ignores `.env` and `.env.production` instead of `.env*`, so `.env.example` can be committed.
- [x] `.env.example` added with `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.
- [x] `auth-schema.ts` generated in the root. It holds Better Auth's four tables: `user`, `session`, `account` and `verification`. No database connection is needed for this step. https://better-auth.com/docs/installation

  ```powershell
  npx auth@latest generate
  ```

  - `role` and `bio` come from `additionalFields` in `lib/auth.ts`. The other `user` columns (`name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`) are Better Auth defaults.
  - This `user` table is the only users table. Other tables point to it through `author_id` or `user_id`.
- [x] `lib/db.ts` passes `authRelations` from `auth-schema.ts` to `drizzle()`, and `lib/auth.ts` passes the whole `auth-schema.ts` to the adapter as `schema`, as in https://better-auth.com/docs/adapters/drizzle (Relations v2). Both are needed: `authRelations` only covers `user`, `session` and `account`, so the adapter finds `verification` through `schema`.
- [x] `drizzle.config.ts` added for drizzle-kit: reads `auth-schema.ts`, writes migrations to `drizzle/`, connects through `DIRECT_URL`. https://orm.drizzle.team/docs/get-started/neon-new
- [x] `npx drizzle-kit generate`
- [x] `npx drizzle-kit migrate`
- [x] `docker init`: Node 22.16.0, npm, build output `.next`, start `npm start`, port 3000. Creates `Dockerfile`, `compose.yaml`, `.dockerignore` and `README.Docker.md`. Development runs on Docker, Neon is only for deploy.
- [x] `compose.yaml` adds `postgres:18-alpine` as service `db`, database `untai`. Version 18 because Neon runs 18. Port 5432 is open so drizzle-kit on Windows can reach it. Service `server` gets `env_file: .env` so the app in the container reads `.env`, and `depends_on: db` so Postgres starts first.
- [x] `.env` points to Postgres in Docker, Neon URLs moved to `.env.production`, because Neon is only for deploy. `DATABASE_URL` uses host `db` for the app in the container, `DIRECT_URL` uses `localhost` for drizzle-kit on Windows.
- [x] `pg` installed and used in `lib/db.ts`, because Drizzle needs a driver and `neon-http` only reaches Neon. https://orm.drizzle.team/docs/get-started-postgresql

  ```powershell
  npm i pg
  npm i -D @types/pg
  ```
- [x] `docker compose up -d db`, then `npx drizzle-kit migrate` for the auth tables in Docker.

## Note: the two generate commands

- `npx auth generate`: auth tables only, writes `auth-schema.ts`.
- `npx drizzle-kit generate`: every table, writes SQL into `drizzle/`.

Adding other tables later:
1. Write the schema file.
2. Add it to `schema` in `drizzle.config.ts` and its relations to `lib/db.ts`.
3. `npx drizzle-kit generate`
4. `npx drizzle-kit migrate`

## Note: Neon's two URLs

The split is about what changes, not when.

- `DIRECT_URL` (direct, host without `-pooler`): any change to the table structure, every time. Creating the tables at init, and also adding a column or a table later. Used by drizzle-kit only.
- `DATABASE_URL` (pooled, host contains `-pooler`): the data inside the tables, through the app. Register, login, saving a Pattern, posting a Recreate.

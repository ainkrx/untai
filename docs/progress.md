# Progress

What has been done in this project, in order, and notes worth keeping.

## Format

Every item in the checklist follows these rules:

1. **Bold subject first.** The item starts with `- [x]`, then the subject in bold, in plain words: what the item is about (**Project**, **Auth schema**, **Docker**). The sentence continues right after it, with no colon or dash between them.
2. **Never bold a command, file name or package.** They go in backticks after the subject: ``**Postgres driver** `pg` installed``, not ``**`pg`** installed``.
3. **Commands in a code block.** Under the item, indented two spaces, fenced as `powershell`. Only the command itself, no `Set-Location` or `cd`.
4. **One detail is an indented line.** Indented two spaces under the item, no bullet. Several details are indented sub-bullets (`  - `).
5. **No blank lines in the list.** Not between items, not inside an item, not around a code block.
6. **Docs link at the end** of the sentence it belongs to.
7. **Longer explanations go in a `## Note: ...` section** below the checklist, as bullets.

## Setup

- [x] **Project** created with:
  ```powershell
  npx create-next-app@latest untai
  ```
  Next.js 16.3.6, React 19.2.8, TypeScript, Tailwind CSS v4, ESLint, App Router (`app/`)
- [x] **Project rules** created in `CLAUDE.md`, adjusted to `docs/app-flow.md`.
- [x] **Writing rule** added to `CLAUDE.md`: no em dash or similar machine-looking marks, no hard wrapping, plain human language, no filler, for every piece of text in the project.
- [x] **Better Auth and Drizzle** installed, both in the root (`D:\git\untai`), since this is one Next.js project with no separate backend folder.
  Better Auth: https://better-auth.com/docs/installation
  ```powershell
  npm install better-auth
  ```
  Drizzle with Neon: https://orm.drizzle.team/docs/get-started/neon-new
  ```powershell
  npm i drizzle-orm@rc @neondatabase/serverless dotenv
  npm i -D drizzle-kit@rc tsx
  ```
- [x] **Drizzle** connected to Neon in `lib/db.ts` (Step 3 of the Drizzle guide, using the pooled `DATABASE_URL`). In `lib/` instead of the guide's `src/`, because this project has no `src/` and keeps shared code in root folders next to `app/`.
- [x] **Better Auth config** in `lib/auth.ts`: Drizzle adapter (Relations v2, because Drizzle is the rc version), email and password login, extra `user` fields `role` (`member` or `admin`, default `member`, required so the column is never NULL, not settable by the user; register only creates members, admins come from the seeder) and `bio`. https://better-auth.com/docs/installation, https://better-auth.com/docs/concepts/database
- [x] **Drizzle adapter** not installed separately: `better-auth` already depends on `@better-auth/drizzle-adapter`, and `lib/auth.ts` imports `/relations-v2` from that copy.
- [x] **Git** ignores `.env` and `.env.production` instead of `.env*` (`.gitignore`), so `.env.example` can be committed.
- [x] **Env example** added in `.env.example` with `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.
- [x] **Auth schema** generated in the root as `auth-schema.ts`. It holds Better Auth's four tables: `user`, `session`, `account` and `verification`. No database connection is needed for this step. https://better-auth.com/docs/installation
  ```powershell
  npx auth@latest generate
  ```
  - `role` and `bio` come from `additionalFields` in `lib/auth.ts`. The other `user` columns (`name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`) are Better Auth defaults.
  - This `user` table is the only users table. Other tables point to it through `author_id` or `user_id`.
- [x] **Auth schema** wired in: `lib/db.ts` passes `authRelations` from `auth-schema.ts` to `drizzle()`, and `lib/auth.ts` passes the whole `auth-schema.ts` to the adapter as `schema` (Relations v2). Both are needed: `authRelations` only covers `user`, `session` and `account`, so the adapter finds `verification` through `schema`. https://better-auth.com/docs/adapters/drizzle
- [x] **Drizzle Kit config** added in `drizzle.config.ts`: reads `auth-schema.ts`, writes migrations to `drizzle/`, connects through `DIRECT_URL`. https://orm.drizzle.team/docs/get-started/neon-new
- [x] **Auth tables migration** generated into `drizzle/`:
  ```powershell
  npx drizzle-kit generate
  ```
- [x] **Auth tables** created in Neon:
  ```powershell
  npx drizzle-kit migrate
  ```
- [x] **Docker** set up with `docker init`: Node 22.16.0, npm, build output `.next`, start `npm start`, port 3000. Creates `Dockerfile`, `compose.yaml`, `.dockerignore` and `README.Docker.md`. Development runs on Docker, Neon is only for deploy.
- [x] **Postgres** added to `compose.yaml`: `postgres:18-alpine` as service `db`, database `untai`. Version 18 because Neon runs 18. Port 5432 is open so drizzle-kit on Windows can reach it. Service `server` gets `env_file: .env` so the app in the container reads `.env`, and `depends_on: db` so Postgres starts first.
- [x] **Env** in `.env` points to Postgres in Docker, Neon URLs moved to `.env.production`, because Neon is only for deploy. `DATABASE_URL` uses host `db` for the app in the container, `DIRECT_URL` uses `localhost` for drizzle-kit on Windows.
- [x] **Postgres driver** `pg` installed and used in `lib/db.ts`, because Drizzle needs a driver and `neon-http` only reaches Neon. https://orm.drizzle.team/docs/get-started-postgresql
  ```powershell
  npm i pg
  npm i -D @types/pg
  ```
- [x] **Auth tables** created in Postgres in Docker:
  ```powershell
  docker compose up -d db
  npx drizzle-kit migrate
  ```
- [x] **Auth schema** moved from `auth-schema.ts` to `lib/schema/auth.ts`, next to `lib/db.ts` and `lib/auth.ts` that import it, so the root stays clean. `npx auth generate` now needs `--output lib/schema/auth.ts`.
- [x] **App schema** in `lib/schema/app.ts` with the plan's tables from `docs/app-flow.md`: `pattern`, `pattern_step`, `recreate`, `report`, `step_progress`, `pattern_counter`.
  - Steps have their own table, because StepProgress points to a step and deleting a step deletes its checks.
  - Tags and images are text arrays on their row. A tag is only its lowercase name, and existing tags come from the other Patterns' arrays.
  - Pattern fields required for a submission are NOT NULL, because a draft needs the same fields (`docs/app-flow.md` flow 3). Step description is NOT NULL too. Step images default to empty, since only the Pattern itself needs an image.
  - `pattern.updated_at` is not updated automatically, because it changes only when the author saves an edit.
  - Plain indexes are only for speed: `where author_id = X` goes straight to that user's rows instead of reading every row. The result is the same without them.
  - No `check` constraints: only the backend writes to the database, so it checks counts, lowercase tags, rating, the Other note and counters. Unique indexes stay, because two requests at the same moment can both pass the backend check: one Recreate per user per Pattern, one Report per user per target (a handled Report is deleted, so no `status` column), one check per step, one counter row per Pattern.
  - `appRelations` (`defineRelationsPart`, like `authRelations`) covers the app tables. Every relation is two-way, including `user` to `pattern`, `recreate`, `report`, `step_progress` and `pattern_counter`.
  - The `user` side of those relations is in `appRelations`, not in `lib/schema/auth.ts`, because `npx auth generate` rewrites that file and `auth.ts` importing from `app.ts` would be a circular import.
  - `user` is in both parts, so `lib/db.ts` merges the two `user` entries. A plain spread would let the app `user` replace the auth one and drop `sessions` and `accounts`.
- [x] **Drizzle Kit config** in `drizzle.config.ts` reads the whole `lib/schema/` folder, so a new schema file there is picked up without touching the config.
- [x] **App tables migration** generated into `drizzle/`:
  ```powershell
  npx drizzle-kit generate
  ```
- [x] **App tables** created in Postgres in Docker:
  ```powershell
  npx drizzle-kit migrate
  ```
- [x] **shadcn/ui** set up with a preset of style Mira and Phosphor Icons, picked on https://ui.shadcn.com/create. It copies each component's source into `components/ui/`, so there is no component library to call at runtime. https://ui.shadcn.com/docs/cli
  ```powershell
  npx shadcn@latest init --preset b1D0ekG8
  ```
  - Writes `components.json` (style `base-mira`, icon library `phosphor`, base color `neutral`), `lib/utils.ts` (`cn`) and the theme variables in `app/globals.css`.
  - Installs `@base-ui/react`, `@phosphor-icons/react`, `class-variance-authority`, `cn`, `shadcn` and `tw-animate-css`.
  - Font is Inter: `app/layout.tsx` loads it into `--font-sans` and puts `font-sans` on `<html>`. Geist Sans is still loaded there but nothing uses it. Geist Mono stays as `--font-mono`.

## Note: the two generate commands

- `npx auth generate --output lib/schema/auth.ts`: auth tables only.
- `npx drizzle-kit generate`: every table, writes SQL into `drizzle/`.

Adding other tables later:
1. Write the schema file.
2. Put it in `lib/schema/` and add its relations to `lib/db.ts`.
3. `npx drizzle-kit generate`
4. `npx drizzle-kit migrate`

## Note: Neon's two URLs

The split is about what changes, not when.

- `DIRECT_URL` (direct, host without `-pooler`): any change to the table structure, every time. Creating the tables at init, and also adding a column or a table later. Used by drizzle-kit only.
- `DATABASE_URL` (pooled, host contains `-pooler`): the data inside the tables, through the app. Register, login, saving a Pattern, posting a Recreate.

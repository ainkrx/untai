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

## Note: Neon's two URLs

The split is about what changes, not when.

- `DIRECT_URL` (direct, host without `-pooler`): any change to the table structure, every time. Creating the tables at init, and also adding a column or a table later. Used by drizzle-kit only.
- `DATABASE_URL` (pooled, host contains `-pooler`): the data inside the tables, through the app. Register, login, saving a Pattern, posting a Recreate.

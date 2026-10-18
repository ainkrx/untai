# Progress

What has been done in this project, in order, with implementation notes. Rules and flows are in `docs/app-flow.md`; how it looks is in `docs/style.md`.

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
- [x] **Navbar and toast components** added into `components/ui/`, with no new packages: they use `@base-ui/react` and `@phosphor-icons/react` from the init. Other components are added when a page needs them.
  ```powershell
  npx shadcn@latest add button input dropdown-menu avatar sheet collapsible toast
  ```
  - `button`: button.
  - `input`: search bar.
  - `dropdown-menu`: the profile dropdown.
  - `avatar`: the profile icon.
  - `sheet`: the hamburger menu.
  - `collapsible`: the category dropdown in the navbar, one component for desktop and the sheet.
  - `toast`: success, info, warning, error and loading toasts. Built on Base UI Toast, so no extra toast library.
- [x] **Navbar** in `components/navbar.tsx`, shown on every page from `app/layout.tsx`. Layout follows `docs/style.md`.
  - It reads the session on the server (`auth.api.getSession`), so logged-in users and guests get different items without a client fetch. `user` is `null` for a guest.
  - Search bar is a plain form: `/search?q=...`.
  - Links go to pages that don't exist yet: `/patterns/new`, `/about`, `/search`, `/my/patterns`, `/my/reviews`, `/settings`, `/login`, `/register`.
  - Logout does nothing yet. It gets wired up with login, since there is no way to be logged in before that.
  - Icons in this server component come from `@phosphor-icons/react/dist/ssr`.
- [x] **Category dropdown** in the navbar, in `components/category-toggle.tsx`. The list comes from the `category` enum in `lib/schema/app.ts`, so it stays the same as the database. The navbar passes the names in, so the client component does not import the schema.
  - A collapsible does not close by itself, so on desktop an invisible layer behind the open list closes it on a click outside. It also closes when a category is clicked. On mobile it stays as before, open in place in the sheet.
- [x] **Light colors** set in `:root` of `app/globals.css`: soft purple and yellow. Which token gets which color is in `docs/style.md`.
- [ ] **Dark colors** in `.dark` are still shadcn's gray.
- [x] **Theme package** `next-themes` installed, as in shadcn's Next.js dark mode guide. https://ui.shadcn.com/docs/dark-mode/next
  ```powershell
  npm install next-themes
  ```
- [x] **Theme provider** from `next-themes` wraps the app in `app/layout.tsx`: class on `<html>`, System by default. Imported straight from the package, since it already ships as a client component, so no `components/theme-provider.tsx` wrapper.
- [x] **Theme toggle** in `components/theme-toggle.tsx`: `ThemeMenu` in the navbar on desktop, `ThemeOptions` in the sheet on mobile. Layout follows `docs/style.md`.
- [x] **Toaster** in `app/layout.tsx` with `limit={5}`: at most 5 toasts on screen at once (Base UI's default is 3). Nothing calls `toast.add` yet.

## Note: hydration mismatch

- The server sends finished HTML first, then React in the browser takes over that HTML. This takeover is called hydration.
- React expects the HTML to be exactly what it would render itself. If the server and the browser render something different, that is a hydration mismatch, and React warns about it in the console.
- The theme causes this, because the saved theme lives in the browser (`localStorage`) and the server cannot read it.
  - `next-themes` puts the `dark` or `light` class on `<html>` before React takes over, so `<html>` differs from the server's. `suppressHydrationWarning` on `<html>` in `app/layout.tsx` tells React this difference is expected.
  - The theme toggle would show a different active icon on the server and in the browser. How it avoids that is in the next note.

## Note: how the theme toggle gets the theme

- The theme value comes from `useTheme()` of `next-themes`. In the browser, `next-themes` reads it from `localStorage` under the key `theme`, and `setTheme` writes it there. On the server there is no `localStorage`, so `theme` is `undefined`.
- `useSyncExternalStore` in `useCurrentTheme` does not know the theme. It only gives `mounted`, through three functions in this order:
  - `subscribe` (`() => () => {}`): React passes it a callback to call when the value changes, and it returns a function that stops listening. Here it does nothing, because "running in the browser" never changes.
  - `getSnapshot` (`() => true`): the value in the browser.
  - `getServerSnapshot` (`() => false`): the value on the server, and in the browser during hydration.
- `mounted` touches the theme in one line: `theme: mounted ? theme : undefined`. While `mounted` is `false`, the theme is forced to `undefined`, the same as on the server, so no icon is active. Once it is `true`, the real theme from `localStorage` is used.
- Order when the page loads:
  1. Server: React calls `getServerSnapshot`, `mounted` is `false`, no icon active.
  2. Browser, hydration: React still calls `getServerSnapshot`, so `mounted` is `false` and the HTML matches the server's.
  3. Browser, right after hydration: React calls `getSnapshot`, gets `true` instead of `false`, and renders again. The saved theme's icon becomes active.
- Only `ThemeMenu`, the icon in the desktop navbar, goes through hydration. `ThemeOptions` sits in the sheet, and the sheet renders its content only while it is open (Base UI's `keepMounted` defaults to `false`). So `ThemeOptions` first renders after hydration, React calls `getSnapshot` right away, and `mounted` is `true` from the first render.

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

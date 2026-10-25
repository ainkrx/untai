// Based on the Next.js guide, Manual Setup: https://nextjs.org/docs/app/guides/testing/vitest. Removed: the React plugin (`@vitejs/plugin-react`), since there are no component tests.
import { defineConfig } from "vitest/config";
// Added: the test database URL, used by `env` below.
import { TEST_DATABASE_URL } from "./test/seed-test-db";

export default defineConfig({
  // Changed: Vite's own tsconfig paths option instead of the `vite-tsconfig-paths` plugin, so `@/` imports work without installing another package (https://vite.dev/config/shared-options#resolve-tsconfigpaths).
  resolve: { tsconfigPaths: true },
  test: {
    // Removed: environment "jsdom", since no test renders a component; Vitest's default "node" is used instead (https://vitest.dev/config/environment).
    // Added: tests read and write the test database, never the development one in .env (https://vitest.dev/config/env).
    env: { DATABASE_URL: TEST_DATABASE_URL },
    // Added: unit tests need no database, integration tests need it filled first, so they are two projects (https://vitest.dev/guide/projects).
    projects: [
      { test: { name: "unit", include: ["**/*.test.ts"] } },
      {
        test: {
          name: "integration",
          include: ["**/*.itest.ts"],
          // Added: fills the test database once before the integration run (https://vitest.dev/config/globalsetup).
          globalSetup: ["test/seed-test-db.ts"],
          // Added: one file at a time, since every integration file shares the test database (https://vitest.dev/config/fileparallelism).
          fileParallelism: false,
        },
      },
    ],
  },
});

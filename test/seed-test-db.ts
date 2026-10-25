// Rebuilds the test database from the migrations and fills it with the seed data once before a run. Used as the global setup of both Vitest (integration) and Playwright.
import { execSync } from "node:child_process";

// The database from compose.test.yaml, never the development one.
export const TEST_DATABASE_URL = "postgres://postgres:postgres@localhost:5433/untai_test";

export default function seedTestDb() {
  execSync("npx tsx lib/seed.mts", {
    stdio: "inherit",
    env: { ...process.env, DIRECT_URL: TEST_DATABASE_URL },
  });
}
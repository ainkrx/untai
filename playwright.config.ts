// Based on the Next.js example: https://github.com/vercel/next.js/blob/canary/examples/with-playwright/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import path from "path";
// Added: the test database URL, used by `webServer.env` below.
import { TEST_DATABASE_URL } from "./test/seed-test-db";

// Changed: falls back to 3001 instead of 3000, so the app under test never collides with the dev server on 3000.
const PORT = process.env.PORT || 3001;

const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: path.join(__dirname, "e2e"),
  retries: 2,

  // Added: fills the test database once before the run (https://playwright.dev/docs/api/class-testconfig#test-config-global-setup).
  globalSetup: "./test/seed-test-db.ts",

  webServer: {
    command: "npm run dev",
    url: baseURL,
    timeout: 120 * 1000,
    // Changed: always false instead of `!process.env.CI`. A server already on this port was not started by this config, so it would be connected to the development database.
    reuseExistingServer: false,
    // Added: runs the app on PORT against the test database instead of the development one in .env. Next reads `process.env` before `.env` (https://nextjs.org/docs/app/guides/environment-variables#environment-variable-load-order) and takes the port from PORT (https://nextjs.org/docs/app/api-reference/cli/next#changing-the-default-port).
    env: {
      ...(process.env as Record<string, string>),
      PORT: String(PORT),
      DATABASE_URL: TEST_DATABASE_URL,
      BETTER_AUTH_URL: baseURL,
    },
  },

  use: {
    baseURL,
    // Changed: "on-first-retry" instead of "retry-with-trace", which is no longer an allowed value (https://playwright.dev/docs/api/class-testoptions#test-options-trace).
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },
    // Removed: "Mobile Safari" (devices["iPhone 12"]), since it runs on WebKit and only Chromium is installed.
  ],
});

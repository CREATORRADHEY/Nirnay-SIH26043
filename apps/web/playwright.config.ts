import { defineConfig, devices } from "@playwright/test";

/**
 * NIRNAY Playwright E2E Configuration
 * Runs against a locally started Next.js dev server and a local FastAPI backend.
 *
 * Usage:
 *   npm run test:e2e           — full headless suite
 *   npm run test:e2e:ui        — Playwright UI explorer
 *   npm run test:e2e -- --headed  — headed for debugging
 *
 * Requires API server running at http://localhost:8000
 * (cd apps/api && uvicorn app.main:app --reload)
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

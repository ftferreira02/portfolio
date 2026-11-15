import { defineConfig, devices } from "@playwright/test";

const PORT = 3123;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // The demos keep pages busy for seconds at a time; more workers than this overload the single test server.
  workers: 3,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

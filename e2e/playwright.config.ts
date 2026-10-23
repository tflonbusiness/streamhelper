import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { defineConfig, devices } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

dotenv.config({ path: path.join(repoRoot, 'server', '.env') })

const appUrl = process.env.APP_URL?.replace(/\/$/, '') ?? 'http://localhost:5173'
const apiUrl = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000'
const authFile = path.join(__dirname, '.auth', 'owner.json')

/** Local runs (and pre-commit) reuse :3000/:5173 when already up; CI starts fresh unless PLAYWRIGHT_REUSE_SERVERS=1. */
function shouldReuseWebServer(): boolean {
  if (process.env.PLAYWRIGHT_FORCE_SERVERS === '1') {
    return false
  }
  if (process.env.PLAYWRIGHT_REUSE_SERVERS === '1') {
    return true
  }
  return !process.env.CI
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'en-US',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
    },
  ],
  webServer: [
    {
      command: 'npm run start:dev',
      cwd: path.join(repoRoot, 'server'),
      url: `${apiUrl}/auth/me`,
      reuseExistingServer: shouldReuseWebServer(),
      timeout: 120_000,
      env: {
        ...process.env,
        KICK_OAUTH_MOCK: 'true',
        APP_URL: appUrl,
      },
    },
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'app'),
      url: appUrl,
      reuseExistingServer: shouldReuseWebServer(),
      timeout: 120_000,
    },
  ],
})

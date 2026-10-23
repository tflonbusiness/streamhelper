import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test as setup, expect } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(__dirname, '../.auth/owner.json')

setup('mock Kick login', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('caz-locale', 'en')
  })

  await page.goto('/auth/oauth/kick/callback?code=mock-kick-code')
  await page.waitForURL(/\/(dashboard|continue)(\?|$)/)

  const me = await page.request.get('/auth/me')
  expect(me.ok()).toBeTruthy()
  const body = (await me.json()) as { user?: { accountId?: number } }
  expect(body.user?.accountId).toBeTruthy()

  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})

import { expect, test } from '@playwright/test'
import {
  deactivateAllLiveGrowingJackpotSessions,
  openGrowingJackpotSession,
  startGrowingJackpotRound,
} from './growing-jackpot-helpers.js'

test.describe.configure({ mode: 'serial' })

test.describe('Growing Jackpot module', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('caz-locale', 'en')
    })
    const me = await page.request.get('/auth/me')
    const { user } = (await me.json()) as { user: { accountId?: number } }
    if (user.accountId) {
      await deactivateAllLiveGrowingJackpotSessions(page, user.accountId)
    }
  })

  test('creates a session and starts a round', async ({ page }) => {
    const title = `E2E jackpot ${Date.now()}`

    await page.goto('/modules/growing-jackpot')
    await expect(
      page.getByRole('heading', { name: 'Growing Jackpot' }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'New session' }).click()
    await expect(
      page.getByRole('heading', { name: 'New Growing Jackpot session' }),
    ).toBeVisible()

    await page.getByLabel('Session title').fill(title)
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('Session created')).toBeVisible()

    await openGrowingJackpotSession(page, title)
    await startGrowingJackpotRound(page)
    await expect(page.getByTestId('growing-jackpot-join-keyword')).toHaveText(
      '!join',
    )
  })

  test('stream widget reflects accepting round', async ({ page }) => {
    const title = `E2E widget ${Date.now()}`

    await page.goto('/modules/growing-jackpot')
    await page.getByRole('button', { name: 'New session' }).click()
    await page.getByLabel('Session title').fill(title)
    await page.getByRole('button', { name: 'Create' }).click()
    const me = await page.request.get('/auth/me')
    const { user } = (await me.json()) as {
      user: { accountUcid?: string }
    }
    expect(user.accountUcid).toBeTruthy()

    await openGrowingJackpotSession(page, title)
    await startGrowingJackpotRound(page)

    await page.goto(`/modules/growing-jackpot/widget/${user.accountUcid}`)
    await expect(page.getByTestId('growing-jackpot-stream-widget')).toBeVisible()
    await expect(page.getByText('Players')).toBeVisible()
    await expect(page.getByText('!join')).toBeVisible()
  })
})

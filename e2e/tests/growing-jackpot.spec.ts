import { expect, test } from '@playwright/test'
import {
  createGrowingJackpotSession,
  deactivateAllLiveGrowingJackpotSessions,
  openGrowingJackpotSession,
  saveGrowingJackpotJoinKeyword,
  startGrowingJackpotRound,
  stopGrowingJackpotRound,
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

  test('off-air session requires go live before starting a round', async ({
    page,
  }) => {
    const stamp = Date.now()
    const liveHolderTitle = `E2E off-air holder ${stamp}`
    const offAirTitle = `E2E off-air ${stamp}`

    await createGrowingJackpotSession(page, liveHolderTitle)
    await createGrowingJackpotSession(page, offAirTitle)
    await openGrowingJackpotSession(page, offAirTitle)

    await expect(page.getByTestId('growing-jackpot-session-go-live')).toBeVisible()
    await expect(
      page.getByText('Go live to start a round'),
    ).toBeVisible()
    await expect(page.getByTestId('growing-jackpot-start-round')).toBeDisabled()
  })

  test('edits session title from the session page', async ({ page }) => {
    const title = `E2E edit ${Date.now()}`
    const updatedTitle = `${title} renamed`

    await createGrowingJackpotSession(page, title)
    await openGrowingJackpotSession(page, title)

    await page
      .getByRole('main')
      .getByRole('button', { name: 'Edit', exact: true })
      .click()
    const editDialog = page.getByRole('dialog', { name: 'Edit session' })
    await expect(editDialog).toBeVisible()
    await editDialog.getByLabel('Session title').fill(updatedTitle)
    await editDialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText('Session title saved')).toBeVisible()
    await expect(page.getByRole('heading', { level: 6, name: updatedTitle })).toBeVisible()
  })

  test('stopping a round early records stopped outcome in history', async ({
    page,
  }) => {
    const title = `E2E stop ${Date.now()}`

    await createGrowingJackpotSession(page, title)
    await openGrowingJackpotSession(page, title)
    await startGrowingJackpotRound(page)
    await stopGrowingJackpotRound(page)

    await expect(page.getByText('Stopped early')).toBeVisible()
    await expect(page.getByTestId('growing-jackpot-join-keyword')).toHaveCount(0)
  })

  test('saved join command is used when the next round starts', async ({
    page,
  }) => {
    const title = `E2E keyword ${Date.now()}`
    const joinKeyword = '!e2ejoin'

    await createGrowingJackpotSession(page, title)
    await openGrowingJackpotSession(page, title)
    await saveGrowingJackpotJoinKeyword(page, joinKeyword)
    await startGrowingJackpotRound(page)

    await expect(page.getByTestId('growing-jackpot-join-keyword')).toHaveText(
      joinKeyword,
    )
  })

  test('archiving a session switches the page to view-only', async ({
    page,
  }) => {
    const title = `E2E archive ${Date.now()}`

    await createGrowingJackpotSession(page, title)
    await openGrowingJackpotSession(page, title)

    await page
      .getByRole('main')
      .getByRole('button', { name: 'Archive', exact: true })
      .click()
    const archiveDialog = page.getByRole('dialog', { name: 'Archive session' })
    await expect(archiveDialog).toBeVisible()
    await archiveDialog
      .getByRole('button', { name: 'Archive', exact: true })
      .click()
    await expect(page.getByText('Session archived')).toBeVisible()
    await expect(
      page.getByText('This session is archived — view only.'),
    ).toBeVisible()
    await expect(page.getByTestId('growing-jackpot-start-round')).toBeDisabled()
    await expect(
      page.getByRole('main').getByRole('button', { name: 'Archive', exact: true }),
    ).toHaveCount(0)
  })

  test('stream widget stays idle when no round is accepting joins', async ({
    page,
  }) => {
    const me = await page.request.get('/auth/me')
    const { user } = (await me.json()) as {
      user: { accountUcid?: string }
    }
    expect(user.accountUcid).toBeTruthy()

    await page.goto(`/modules/growing-jackpot/widget/${user.accountUcid}`)
    await expect(page.getByTestId('growing-jackpot-stream-widget')).toBeVisible()
    await expect(page.getByText('Players')).toHaveCount(0)
    await expect(page.getByText('Growing Jackpot')).toHaveCount(0)
  })
})

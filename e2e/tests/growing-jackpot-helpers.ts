import { expect, type Page } from '@playwright/test'

export async function deactivateAllLiveGrowingJackpotSessions(
  page: Page,
  accountId: number,
): Promise<void> {
  const response = await page.request.get(
    `/accounts/${accountId}/growing-jackpots?archived=false&page=1&limit=50`,
  )
  expect(response.ok()).toBeTruthy()
  const body = (await response.json()) as {
    sessions: Array<{ id: number; status: string }>
  }
  for (const session of body.sessions) {
    if (session.status === 'live') {
      const deactivate = await page.request.post(
        `/accounts/${accountId}/growing-jackpots/${session.id}/deactivate`,
      )
      expect(deactivate.ok()).toBeTruthy()
    }
  }
}

export async function ensureGrowingJackpotSessionLive(page: Page): Promise<void> {
  const goLive = page.getByTestId('growing-jackpot-session-go-live')
  if (await goLive.isVisible()) {
    await goLive.click()
    await expect(goLive).toBeHidden()
  }
}

export async function openGrowingJackpotSession(
  page: Page,
  title: string,
): Promise<void> {
  const titleLink = page.getByRole('link', { name: title }).first()
  const openLink = page.getByRole('link', { name: `Open ${title}` }).first()
  await expect(titleLink.or(openLink)).toBeVisible()
  if (await titleLink.isVisible()) {
    await titleLink.click()
  } else {
    await openLink.click()
  }
  await expect(page).toHaveURL(/\/modules\/growing-jackpot\/\d+/)
}

export async function startGrowingJackpotRound(page: Page): Promise<void> {
  await ensureGrowingJackpotSessionLive(page)
  const startRound = page.getByTestId('growing-jackpot-start-round')
  await expect(startRound).toBeEnabled()
  await startRound.click()
  await expect(page.getByTestId('growing-jackpot-stop-round')).toBeVisible()
}

export async function createGrowingJackpotSession(
  page: Page,
  title: string,
): Promise<void> {
  await page.goto('/modules/growing-jackpot')
  await page.getByRole('button', { name: 'New session' }).click()
  await page.getByLabel('Session title').fill(title)
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByText('Session created')).toBeVisible()
}

export async function stopGrowingJackpotRound(page: Page): Promise<void> {
  const stopRound = page.getByTestId('growing-jackpot-stop-round')
  await expect(stopRound).toBeVisible()
  await stopRound.click()
  await expect(page.getByTestId('growing-jackpot-start-round')).toBeVisible()
}

export async function saveGrowingJackpotJoinKeyword(
  page: Page,
  joinKeyword: string,
): Promise<void> {
  await page.getByLabel('Join command').fill(joinKeyword)
  const saveSettings = page.getByRole('button', { name: 'Save' })
  await expect(saveSettings).toBeEnabled()
  await saveSettings.click()
  await expect(page.getByText('Settings saved')).toBeVisible()
}

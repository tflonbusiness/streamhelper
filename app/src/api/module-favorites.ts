import { readApiErrorMessage } from '@/api/read-api-error-message'
import i18n from '@/i18n/init-i18n'

export type ModuleFavoritesResponse = {
  moduleIds: string[]
}

export async function fetchModuleFavorites(): Promise<ModuleFavoritesResponse> {
  const response = await fetch('/auth/me/module-favorites', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(response, i18n.t('errors.failedToLoadSession')),
    )
  }

  return response.json() as Promise<ModuleFavoritesResponse>
}

export async function putModuleFavorites(
  moduleIds: string[],
): Promise<ModuleFavoritesResponse> {
  const response = await fetch('/auth/me/module-favorites', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleIds }),
  })

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(
        response,
        i18n.t('modules.favorite.saveError'),
      ),
    )
  }

  return response.json() as Promise<ModuleFavoritesResponse>
}

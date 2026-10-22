import i18n from '@/i18n/init-i18n'

const API_ERROR_CODE_KEYS: Record<string, string> = {
  SUBSCRIPTION_EXPIRED: 'errors.subscriptionExpired',
}

function resolveApiErrorCode(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }
  const record = data as Record<string, unknown>
  const message = record.message
  if (message && typeof message === 'object' && !Array.isArray(message)) {
    const code = (message as Record<string, unknown>).code
    if (typeof code === 'string') {
      return code
    }
  }
  if (typeof record.code === 'string') {
    return record.code
  }
  return null
}

function messageFromPayload(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }
  const record = data as Record<string, unknown>
  const message = record.message
  if (typeof message === 'string') {
    return message
  }
  if (Array.isArray(message)) {
    return message.join(', ')
  }
  if (message && typeof message === 'object') {
    const nested = (message as Record<string, unknown>).message
    if (typeof nested === 'string') {
      return nested
    }
  }
  return null
}

export function translateApiErrorPayload(data: unknown, fallback: string): string {
  const code = resolveApiErrorCode(data)
  if (code && API_ERROR_CODE_KEYS[code]) {
    return i18n.t(API_ERROR_CODE_KEYS[code])
  }
  const raw = messageFromPayload(data)
  if (raw === 'Account subscription has expired') {
    return i18n.t('errors.subscriptionExpired')
  }
  return raw ?? fallback
}

export async function readApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await response.json()
    return translateApiErrorPayload(data, fallback)
  } catch {
    return fallback
  }
}

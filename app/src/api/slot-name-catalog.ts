import i18n from '@/i18n/init-i18n'
export async function fetchSlotNameCatalog(): Promise<string[]> {
  const response = await fetch('/slot-names.json')
  if (!response.ok) {
    throw new Error(i18n.t('errors.api.loadSlotCatalog'))
  }

  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every((entry) => typeof entry === 'string')) {
    throw new Error(i18n.t('errors.api.invalidSlotCatalog'))
  }

  return data
}

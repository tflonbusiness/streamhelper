export async function fetchSlotNameCatalog(): Promise<string[]> {
  const response = await fetch('/slot-names.json')
  if (!response.ok) {
    throw new Error('Could not load slot name catalog')
  }

  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every((entry) => typeof entry === 'string')) {
    throw new Error('Invalid slot name catalog')
  }

  return data
}

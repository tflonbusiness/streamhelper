export function formatGrowingJackpotDisplayPrize(
  displayPrize: number,
  prizeDisplayCap: number | null | undefined,
): string {
  const current = Number.isInteger(displayPrize)
    ? String(displayPrize)
    : displayPrize.toFixed(2)
  if (prizeDisplayCap === null || prizeDisplayCap === undefined) {
    return current
  }
  const cap = Number.isInteger(prizeDisplayCap)
    ? String(prizeDisplayCap)
    : prizeDisplayCap.toFixed(2)
  return `${current} / ${cap}`
}

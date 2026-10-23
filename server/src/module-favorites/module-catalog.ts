/** Module ids that may appear in a user's favorite list (available operator modules). */
export const FAVORITABLE_MODULE_IDS = [
  'bonus-buy',
  'prize-spin',
  'chat-roll',
  'media-interactive',
  'first-reaction',
  'growing-jackpot',
] as const;

export type FavoritableModuleId = (typeof FAVORITABLE_MODULE_IDS)[number];

const favoritableSet = new Set<string>(FAVORITABLE_MODULE_IDS);

export const DEFAULT_FAVORITE_MODULE_IDS: FavoritableModuleId[] = [
  'bonus-buy',
  'prize-spin',
  'chat-roll',
];

export function isFavoritableModuleId(value: string): value is FavoritableModuleId {
  return favoritableSet.has(value);
}

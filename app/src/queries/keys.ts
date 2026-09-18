import type { PrizeSpinArchivedFilter } from '@/api/prize-spin'

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
  members: (accountId: number) =>
    [...authKeys.all, 'members', accountId] as const,
}

export type PrizeSpinListParams = {
  archived: PrizeSpinArchivedFilter
  page: number
  limit: number
}

export const prizeSpinKeys = {
  all: ['prizeSpins'] as const,
  lists: () => [...prizeSpinKeys.all, 'list'] as const,
  list: (accountId: number, params: PrizeSpinListParams) =>
    [...prizeSpinKeys.lists(), accountId, params] as const,
  widget: (accountId: number) =>
    [...prizeSpinKeys.all, 'widget', accountId] as const,
  session: (accountId: number, prizeSpinId: number) =>
    [...prizeSpinKeys.all, 'session', accountId, prizeSpinId] as const,
  publicWidget: (ucid: string) =>
    [...prizeSpinKeys.all, 'publicWidget', ucid] as const,
}

export const bonusBuyKeys = {
  all: ['bonusBuys'] as const,
  lists: () => [...bonusBuyKeys.all, 'list'] as const,
  list: (accountId: number) => [...bonusBuyKeys.lists(), accountId] as const,
  session: (accountId: number, bonusBuyId: number) =>
    [...bonusBuyKeys.all, 'session', accountId, bonusBuyId] as const,
  widget: (accountId: number) =>
    [...bonusBuyKeys.all, 'widget', accountId] as const,
  publicWidget: (bonusBuyId: number) =>
    [...bonusBuyKeys.all, 'publicWidget', bonusBuyId] as const,
}

export const kickChannelKeys = {
  all: ['kickChannel'] as const,
  detail: (accountId: number) =>
    [...kickChannelKeys.all, accountId] as const,
}

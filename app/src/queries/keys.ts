import type { BonusBuyArchivedFilter } from '@/api/bonus-buy'
import type { ChatRollArchivedFilter } from '@/api/chat-roll'
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
  publicWidget: (prizeSpinId: number) =>
    [...prizeSpinKeys.all, 'publicWidget', prizeSpinId] as const,
}

export type BonusBuyListParams = {
  archived: BonusBuyArchivedFilter
  page: number
  limit: number
}

export const bonusBuyKeys = {
  all: ['bonusBuys'] as const,
  lists: () => [...bonusBuyKeys.all, 'list'] as const,
  list: (accountId: number, params: BonusBuyListParams) =>
    [...bonusBuyKeys.lists(), accountId, params] as const,
  session: (accountId: number, bonusBuyId: number) =>
    [...bonusBuyKeys.all, 'session', accountId, bonusBuyId] as const,
  widget: (accountId: number, bonusBuyId: number) =>
    [...bonusBuyKeys.all, 'widget', accountId, bonusBuyId] as const,
  presets: (accountId: number) =>
    [...bonusBuyKeys.all, 'presets', accountId] as const,
  publicWidget: (bonusBuyId: number) =>
    [...bonusBuyKeys.all, 'publicWidget', bonusBuyId] as const,
}

export const chatRollKeys = {
  all: ['chatRolls'] as const,
  lists: () => [...chatRollKeys.all, 'list'] as const,
  list: (accountId: number, params: ChatRollListParams) =>
    [...chatRollKeys.lists(), accountId, params] as const,
  widget: (accountId: number) =>
    [...chatRollKeys.all, 'widget', accountId] as const,
  session: (accountId: number, chatRollId: number) =>
    [...chatRollKeys.all, 'session', accountId, chatRollId] as const,
}

export type ChatRollListParams = {
  archived: ChatRollArchivedFilter
  page: number
  limit: number
}

export const kickChannelKeys = {
  all: ['kickChannel'] as const,
  detail: (accountId: number) =>
    [...kickChannelKeys.all, accountId] as const,
}

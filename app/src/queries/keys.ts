import type { BonusBuyArchivedFilter } from '@/api/bonus-buy'
import type { ChatRollArchivedFilter } from '@/api/chat-roll'
import type { PrizeSpinArchivedFilter } from '@/api/prize-spin'

import type {
  AccountMemberRoleFilter,
  AccountMemberSortField,
  AccountMemberSortOrder,
  AccountMemberStatusFilter,
} from '@/api/auth'

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
  membersRoot: (accountId: number) =>
    [...authKeys.all, 'members', accountId] as const,
  members: (
    accountId: number,
    params: AccountMembersListParams,
  ) => [...authKeys.membersRoot(accountId), params] as const,
}

export type AccountMembersListParams = {
  page: number
  limit: number
  role: AccountMemberRoleFilter
  status: AccountMemberStatusFilter
  sortBy: AccountMemberSortField
  sortOrder: AccountMemberSortOrder
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
  publicWidget: (accountUcid: string) =>
    [...prizeSpinKeys.all, 'publicWidget', accountUcid] as const,
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
  widget: (accountId: number) =>
    [...bonusBuyKeys.all, 'widget', accountId] as const,
  presets: (accountId: number) =>
    [...bonusBuyKeys.all, 'presets', accountId] as const,
  publicWidget: (accountUcid: string) =>
    [...bonusBuyKeys.all, 'publicWidget', accountUcid] as const,
}

export const chatRollKeys = {
  all: ['chatRolls'] as const,
  lists: () => [...chatRollKeys.all, 'list'] as const,
  list: (accountId: number, params: ChatRollListParams) =>
    [...chatRollKeys.lists(), accountId, params] as const,
  widget: (accountId: number) =>
    [...chatRollKeys.all, 'widget', accountId] as const,
  publicWidget: (accountUcid: string) =>
    [...chatRollKeys.all, 'publicWidget', accountUcid] as const,
  session: (accountId: number, chatRollId: number) =>
    [...chatRollKeys.all, 'session', accountId, chatRollId] as const,
}

export type ChatRollListParams = {
  archived: ChatRollArchivedFilter
  page: number
  limit: number
}

export type FirstReactionListParams = {
  archived: 'false' | 'true' | 'all'
  page: number
  limit: number
}

export type FirstReactionDrawListParams = {
  page: number
  limit: number
  sortBy: import('@/api/first-reaction').FirstReactionDrawSortField
  sortOrder: import('@/api/first-reaction').FirstReactionDrawSortOrder
}

export const firstReactionKeys = {
  all: ['firstReactions'] as const,
  lists: () => [...firstReactionKeys.all, 'list'] as const,
  list: (accountId: number, params: FirstReactionListParams) =>
    [...firstReactionKeys.lists(), accountId, params] as const,
  widget: (accountId: number) =>
    [...firstReactionKeys.all, 'widget', accountId] as const,
  presets: (accountId: number) =>
    [...firstReactionKeys.all, 'widgetPresets', accountId] as const,
  publicWidget: (accountUcid: string) =>
    [...firstReactionKeys.all, 'publicWidget', accountUcid] as const,
  session: (accountId: number, firstReactionId: number) =>
    [...firstReactionKeys.all, 'session', accountId, firstReactionId] as const,
  drawsRoot: (accountId: number, firstReactionId: number) =>
    [
      ...firstReactionKeys.all,
      'draws',
      accountId,
      firstReactionId,
    ] as const,
  draws: (
    accountId: number,
    firstReactionId: number,
    params: FirstReactionDrawListParams,
  ) =>
    [
      ...firstReactionKeys.drawsRoot(accountId, firstReactionId),
      params,
    ] as const,
}

export const kickChannelKeys = {
  all: ['kickChannel'] as const,
  detail: (accountId: number) =>
    [...kickChannelKeys.all, accountId] as const,
}

export type GrowingJackpotListParams = {
  archived: 'false' | 'true' | 'all'
  page: number
  limit: number
}

export const growingJackpotKeys = {
  all: ['growingJackpots'] as const,
  lists: () => [...growingJackpotKeys.all, 'list'] as const,
  list: (accountId: number, params: GrowingJackpotListParams) =>
    [...growingJackpotKeys.lists(), accountId, params] as const,
  publicWidget: (accountUcid: string) =>
    [...growingJackpotKeys.all, 'publicWidget', accountUcid] as const,
  session: (accountId: number, growingJackpotId: number) =>
    [...growingJackpotKeys.all, 'session', accountId, growingJackpotId] as const,
  widget: (accountId: number) =>
    [...growingJackpotKeys.all, 'widget', accountId] as const,
  roundsRoot: (accountId: number, growingJackpotId: number) =>
    [
      ...growingJackpotKeys.all,
      'rounds',
      accountId,
      growingJackpotId,
    ] as const,
  rounds: (
    accountId: number,
    growingJackpotId: number,
    page: number,
    limit: number,
  ) =>
    [
      ...growingJackpotKeys.roundsRoot(accountId, growingJackpotId),
      page,
      limit,
    ] as const,
}

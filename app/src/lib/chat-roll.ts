export type ChatRollRoleId =
  | 'moderator'
  | 'vip'
  | 'og'
  | 'channel_follower'
  | 'paid_subscriber'

export type WeightCombineMode = 'highest' | 'sum'

export type ChatRollRoleSetting = {
  enabled: boolean
  weight: number
}

export type ChatRollParticipant = {
  id: string
  displayName: string
  roleIds: ChatRollRoleId[]
}

export type ChatRollWinner = {
  id: string
  displayName: string
}

export type ChatRollPageState = {
  keyword: string
  combineMode: WeightCombineMode
  excludeWinnerAfterRoll: boolean
  replyInChat: boolean
  roles: Record<ChatRollRoleId, ChatRollRoleSetting>
  participants: ChatRollParticipant[]
  winners: ChatRollWinner[]
}

export const CHAT_ROLL_ROLE_META: {
  id: ChatRollRoleId
  label: string
  description: string
}[] = [
  {
    id: 'moderator',
    label: 'Moderator',
    description: 'Channel moderators',
  },
  {
    id: 'vip',
    label: 'VIP',
    description: 'VIP badge in chat',
  },
  {
    id: 'og',
    label: 'OG',
    description: 'OG badge in chat',
  },
  {
    id: 'channel_follower',
    label: 'Channel follower',
    description: 'Follows the channel',
  },
  {
    id: 'paid_subscriber',
    label: 'Paid subscriber',
    description: 'Active paid subscription',
  },
]

export const CHAT_ROLL_ROLE_CHIP_LABEL: Record<ChatRollRoleId, string> = {
  moderator: 'Mod',
  vip: 'VIP',
  og: 'OG',
  channel_follower: 'Follower',
  paid_subscriber: 'Sub',
}

const DEFAULT_ROLE_SETTINGS: Record<ChatRollRoleId, ChatRollRoleSetting> = {
  moderator: { enabled: false, weight: 1 },
  vip: { enabled: true, weight: 2 },
  og: { enabled: false, weight: 1.5 },
  channel_follower: { enabled: false, weight: 1 },
  paid_subscriber: { enabled: true, weight: 2 },
}

export const CHAT_ROLL_MOCK_PARTICIPANTS: ChatRollParticipant[] = [
  { id: 'p1', displayName: 'nightowl_42', roleIds: ['vip'] },
  { id: 'p2', displayName: 'slotking', roleIds: ['paid_subscriber'] },
  { id: 'p3', displayName: 'mod_alex', roleIds: ['moderator'] },
  { id: 'p4', displayName: 'luckyviewer', roleIds: [] },
  { id: 'p5', displayName: 'og_wolf', roleIds: ['og', 'vip'] },
  { id: 'p6', displayName: 'newfan99', roleIds: ['channel_follower'] },
]

export const CHAT_ROLL_MOCK_WINNERS: ChatRollWinner[] = [
  { id: 'w1', displayName: 'past_winner_one' },
  { id: 'w2', displayName: 'past_winner_two' },
  { id: 'w3', displayName: 'past_winner_three' },
]

export function createDefaultChatRollState(): ChatRollPageState {
  return {
    keyword: '!roll',
    combineMode: 'highest',
    excludeWinnerAfterRoll: true,
    replyInChat: false,
    roles: { ...DEFAULT_ROLE_SETTINGS },
    participants: [...CHAT_ROLL_MOCK_PARTICIPANTS],
    winners: [...CHAT_ROLL_MOCK_WINNERS],
  }
}

function storageKey(accountId: number) {
  return `caz-chat-roll-${accountId}`
}

export function loadChatRollState(accountId: number): ChatRollPageState {
  try {
    const raw = localStorage.getItem(storageKey(accountId))
    if (!raw) {
      return createDefaultChatRollState()
    }
    const parsed = JSON.parse(raw) as Partial<ChatRollPageState>
    if (
      typeof parsed.keyword !== 'string' ||
      (parsed.combineMode !== 'highest' && parsed.combineMode !== 'sum') ||
      !parsed.roles ||
      !Array.isArray(parsed.participants) ||
      !Array.isArray(parsed.winners)
    ) {
      return createDefaultChatRollState()
    }
    return {
      ...createDefaultChatRollState(),
      ...parsed,
      excludeWinnerAfterRoll: parsed.excludeWinnerAfterRoll ?? true,
      replyInChat: parsed.replyInChat ?? false,
    }
  } catch {
    return createDefaultChatRollState()
  }
}

export function saveChatRollState(
  accountId: number,
  state: ChatRollPageState,
): void {
  localStorage.setItem(storageKey(accountId), JSON.stringify(state))
}

export function clampRoleWeight(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.1
  }
  return Math.min(100, Math.max(0.1, Math.round(value * 10) / 10))
}

export function computeParticipantCoefficient(
  participant: ChatRollParticipant,
  roles: Record<ChatRollRoleId, ChatRollRoleSetting>,
  combineMode: WeightCombineMode,
): number {
  const weights = participant.roleIds
    .filter((roleId) => roles[roleId]?.enabled)
    .map((roleId) => roles[roleId].weight)

  if (weights.length === 0) {
    return 0
  }

  if (combineMode === 'highest') {
    return Math.max(...weights)
  }

  return weights.reduce((total, weight) => total + weight, 0)
}

export function formatCoefficient(value: number): string {
  if (value <= 0) {
    return '0x'
  }
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}x` : `${rounded}x`
}

export function getEligibleParticipants(
  participants: ChatRollParticipant[],
  roles: Record<ChatRollRoleId, ChatRollRoleSetting>,
  combineMode: WeightCombineMode,
): ChatRollParticipant[] {
  return participants.filter(
    (participant) =>
      computeParticipantCoefficient(participant, roles, combineMode) > 0,
  )
}

export function pickWeightedParticipant(
  participants: ChatRollParticipant[],
  roles: Record<ChatRollRoleId, ChatRollRoleSetting>,
  combineMode: WeightCombineMode,
): ChatRollParticipant | null {
  const weighted = participants
    .map((participant) => ({
      participant,
      weight: computeParticipantCoefficient(participant, roles, combineMode),
    }))
    .filter((entry) => entry.weight > 0)

  if (weighted.length === 0) {
    return null
  }

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0)
  let random = Math.random() * totalWeight

  for (const entry of weighted) {
    if (random < entry.weight) {
      return entry.participant
    }
    random -= entry.weight
  }

  return weighted[weighted.length - 1].participant
}

import type { FirstReactionSettings } from '@/api/first-reaction'
import type { ChatRollRoleId, ChatRollRoleSetting } from '@/lib/chat-roll'

export const FIRST_REACTION_ROLE_IDS: ChatRollRoleId[] = [
  'viewer',
  'paid_subscriber',
  'vip',
  'og',
  'moderator',
]

const DEFAULT_FIRST_REACTION_ROLE_SETTINGS: Record<
  ChatRollRoleId,
  ChatRollRoleSetting
> = {
  moderator: { enabled: false, weight: 1 },
  vip: { enabled: false, weight: 1 },
  og: { enabled: false, weight: 1 },
  viewer: { enabled: true, weight: 1 },
  paid_subscriber: { enabled: false, weight: 1 },
}

export function resolveFirstReactionRoleSettings(
  raw: FirstReactionSettings['roleSettings'],
): Record<ChatRollRoleId, ChatRollRoleSetting> {
  const result = { ...DEFAULT_FIRST_REACTION_ROLE_SETTINGS }
  for (const roleId of FIRST_REACTION_ROLE_IDS) {
    const entry = raw[roleId]
    if (!entry || typeof entry !== 'object') {
      continue
    }
    const weight =
      typeof entry.weight === 'number' && Number.isFinite(entry.weight)
        ? entry.weight
        : result[roleId].weight
    result[roleId] = {
      enabled: entry.enabled === true,
      weight,
    }
  }
  return result
}

export function hasEnabledFirstReactionParticipantRole(
  settings: FirstReactionSettings,
): boolean {
  const roles = resolveFirstReactionRoleSettings(settings.roleSettings)
  return FIRST_REACTION_ROLE_IDS.some((roleId) => roles[roleId].enabled)
}

export function setFirstReactionRoleEnabled(
  settings: FirstReactionSettings,
  roleId: ChatRollRoleId,
  enabled: boolean,
): FirstReactionSettings {
  const roles = resolveFirstReactionRoleSettings(settings.roleSettings)
  return {
    ...settings,
    roleSettings: {
      ...settings.roleSettings,
      [roleId]: { ...roles[roleId], enabled },
    },
  }
}

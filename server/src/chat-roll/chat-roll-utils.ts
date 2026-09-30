import { CHAT_ROLL_WIDGET_KEYWORD_PREFIX_MAX_LENGTH } from './chat-roll-widget.constants.js';
import { initialSessionStatusOnCreate } from '../session-lifecycle/initial-session-status-on-create.js';

export type ChatRollRoleId =
  | 'moderator'
  | 'vip'
  | 'og'
  | 'viewer'
  | 'paid_subscriber';

export type WeightCombineMode = 'highest' | 'sum';

export type ChatRollRoleSetting = {
  enabled: boolean;
  weight: number;
};

export type ChatRollRoleSettings = Record<ChatRollRoleId, ChatRollRoleSetting>;

export const CHAT_ROLL_ROLE_IDS: ChatRollRoleId[] = [
  'viewer',
  'paid_subscriber',
  'vip',
  'og',
  'moderator',
];

export const DEFAULT_CHAT_ROLL_ROLE_SETTINGS: ChatRollRoleSettings = {
  moderator: { enabled: false, weight: 1 },
  vip: { enabled: false, weight: 1 },
  og: { enabled: false, weight: 1 },
  viewer: { enabled: true, weight: 1 },
  paid_subscriber: { enabled: false, weight: 1 },
};

export function clampRoleWeight(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.1;
  }
  return Math.min(100, Math.max(0.1, Math.round(value * 10) / 10));
}

export function normalizeRoleSettings(
  input: unknown,
): ChatRollRoleSettings | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const raw = input as Record<string, unknown>;
  const record = { ...raw };
  if (
    record.channel_follower &&
    typeof record.channel_follower === 'object' &&
    record.viewer === undefined
  ) {
    record.viewer = record.channel_follower;
  }
  delete record.channel_follower;

  const result = {} as ChatRollRoleSettings;

  for (const roleId of CHAT_ROLL_ROLE_IDS) {
    const entry = record[roleId];
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    const setting = entry as Record<string, unknown>;
    if (typeof setting.enabled !== 'boolean') {
      return null;
    }
    const weight =
      typeof setting.weight === 'number'
        ? setting.weight
        : Number.parseFloat(String(setting.weight));
    if (!Number.isFinite(weight)) {
      return null;
    }
    result[roleId] = {
      enabled: setting.enabled,
      weight: clampRoleWeight(weight),
    };
  }

  return result;
}

/** @deprecated Use `initialSessionStatusOnCreate` from session-lifecycle. */
export const initialChatRollStatusOnCreate = initialSessionStatusOnCreate;

/** True when the user has at least one role that is enabled for this session. */
export function canJoinChatRollWithRoles(
  roleIds: string[],
  roles: ChatRollRoleSettings,
): boolean {
  return roleIds
    .filter((roleId): roleId is ChatRollRoleId =>
      CHAT_ROLL_ROLE_IDS.includes(roleId as ChatRollRoleId),
    )
    .some((roleId) => roles[roleId]?.enabled);
}

export function computeParticipantCoefficient(
  roleIds: string[],
  roles: ChatRollRoleSettings,
  combineMode: WeightCombineMode,
): number {
  const weights = roleIds
    .filter((roleId): roleId is ChatRollRoleId =>
      CHAT_ROLL_ROLE_IDS.includes(roleId as ChatRollRoleId),
    )
    .filter((roleId) => roles[roleId]?.enabled)
    .map((roleId) => roles[roleId].weight);

  if (weights.length === 0) {
    return 0;
  }

  if (combineMode === 'highest') {
    return Math.max(...weights);
  }

  return weights.reduce((total, weight) => total + weight, 0);
}

export function pickWeightedParticipant<
  T extends { id: number; roleIds: string[] },
>(participants: T[], roles: ChatRollRoleSettings, combineMode: WeightCombineMode): T | null {
  const weighted = participants
    .map((participant) => ({
      participant,
      weight: computeParticipantCoefficient(
        participant.roleIds,
        roles,
        combineMode,
      ),
    }))
    .filter((entry) => entry.weight > 0);

  if (weighted.length === 0) {
    return null;
  }

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let random = Math.random() * totalWeight;

  for (const entry of weighted) {
    if (random < entry.weight) {
      return entry.participant;
    }
    random -= entry.weight;
  }

  return weighted[weighted.length - 1].participant;
}

export function normalizeKeyword(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 32) {
    return null;
  }
  return trimmed;
}

export function normalizeWidgetKeywordPrefix(value: string): string | null {
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > CHAT_ROLL_WIDGET_KEYWORD_PREFIX_MAX_LENGTH
  ) {
    return null;
  }
  return trimmed;
}

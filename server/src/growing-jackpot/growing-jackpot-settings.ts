import {
  DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
  normalizeKeyword,
  normalizeRoleSettings,
  type ChatRollRoleSettings,
  type WeightCombineMode,
} from '../chat-roll/chat-roll-utils.js';

export type GrowingJackpotSettings = {
  joinKeyword: string;
  timerSeconds: number;
  prizeBase: number;
  prizeStepPerJoin: number;
  prizeDisplayCap: number | null;
  weightCombineMode: WeightCombineMode;
  announceWinnerInChat: boolean;
  winnerOverlaySeconds: number;
  roleSettings: ChatRollRoleSettings;
};

export const GROWING_JACKPOT_DEFAULT_SETTINGS: GrowingJackpotSettings = {
  joinKeyword: '!join',
  timerSeconds: 300,
  prizeBase: 0,
  prizeStepPerJoin: 1,
  prizeDisplayCap: null,
  weightCombineMode: 'highest',
  announceWinnerInChat: true,
  winnerOverlaySeconds: 8,
  roleSettings: DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
};

function parseRoleSettings(raw: unknown): ChatRollRoleSettings {
  if (!raw || typeof raw !== 'object') {
    return GROWING_JACKPOT_DEFAULT_SETTINGS.roleSettings;
  }
  const record = { ...raw } as Record<string, unknown>;
  if (
    record.channel_follower &&
    typeof record.channel_follower === 'object' &&
    record.viewer === undefined
  ) {
    record.viewer = record.channel_follower;
  }
  delete record.channel_follower;
  const normalized = normalizeRoleSettings(record);
  return normalized ?? GROWING_JACKPOT_DEFAULT_SETTINGS.roleSettings;
}

function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const n =
    typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(n)));
}

function clampPrize(value: unknown, fallback: number): number {
  const n =
    typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n) || n < 0) {
    return fallback;
  }
  return Math.min(1_000_000, Math.round(n * 100) / 100);
}

export function parseGrowingJackpotSettings(raw: unknown): GrowingJackpotSettings {
  const base = { ...GROWING_JACKPOT_DEFAULT_SETTINGS };
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const input = raw as Record<string, unknown>;

  const keywordRaw =
    typeof input.joinKeyword === 'string'
      ? input.joinKeyword
      : base.joinKeyword;
  const normalizedKeyword = normalizeKeyword(keywordRaw) ?? base.joinKeyword;

  const capRaw = input.prizeDisplayCap;
  const prizeDisplayCap =
    capRaw === null || capRaw === undefined
      ? null
      : clampPrize(capRaw, base.prizeDisplayCap ?? 0);

  const combineMode =
    input.weightCombineMode === 'sum' ? 'sum' : 'highest';

  return {
    joinKeyword: normalizedKeyword,
    timerSeconds: clampInt(input.timerSeconds, 30, 3600, base.timerSeconds),
    prizeBase: clampPrize(input.prizeBase, base.prizeBase),
    prizeStepPerJoin: clampPrize(
      input.prizeStepPerJoin,
      base.prizeStepPerJoin,
    ),
    prizeDisplayCap,
    weightCombineMode: combineMode,
    announceWinnerInChat: input.announceWinnerInChat !== false,
    winnerOverlaySeconds: clampInt(
      input.winnerOverlaySeconds,
      3,
      120,
      base.winnerOverlaySeconds,
    ),
    roleSettings: parseRoleSettings(input.roleSettings),
  };
}

export function mergeGrowingJackpotSettingsPatch(
  current: GrowingJackpotSettings,
  patch: Record<string, unknown>,
): GrowingJackpotSettings {
  return parseGrowingJackpotSettings({ ...current, ...patch });
}

export function computeDisplayPrize(
  settings: GrowingJackpotSettings,
  participantCount: number,
): number {
  const raw =
    settings.prizeBase + participantCount * settings.prizeStepPerJoin;
  if (
    settings.prizeDisplayCap !== null &&
    raw > settings.prizeDisplayCap
  ) {
    return settings.prizeDisplayCap;
  }
  return raw;
}

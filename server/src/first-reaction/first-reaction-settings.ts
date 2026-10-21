import {
  DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
  normalizeRoleSettings,
  type ChatRollRoleSettings,
} from '../chat-roll/chat-roll-utils.js';

export type FirstReactionWordSource = 'manual' | 'generated';
export type FirstReactionManualScope = 'per_draw' | 'per_session';
export type FirstReactionGenerationPool =
  | 'builtin_casino'
  | 'builtin_general'
  | 'custom_list';
export type FirstReactionOnTimeout = 'close_no_winner';

export type FirstReactionSettings = {
  wordSource: FirstReactionWordSource;
  manualScope: FirstReactionManualScope;
  sessionKeyword: string | null;
  generationPool: FirstReactionGenerationPool;
  customWords: string[];
  avoidRepeatUntilPoolExhausted: boolean;
  acceptTimeoutEnabled: boolean;
  acceptTimeoutSeconds: number;
  onTimeout: FirstReactionOnTimeout;
  preAcceptDelayMs: number;
  startCooldownEnabled: boolean;
  startCooldownSeconds: number;
  autoSeriesEnabled: boolean;
  autoSeriesLength: number;
  announceWinnerInChat: boolean;
  winnerOverlaySeconds: number;
  roleSettings: ChatRollRoleSettings;
};

export const FIRST_REACTION_DEFAULT_SETTINGS: FirstReactionSettings = {
  wordSource: 'manual',
  manualScope: 'per_draw',
  sessionKeyword: null,
  generationPool: 'builtin_casino',
  customWords: [],
  avoidRepeatUntilPoolExhausted: true,
  acceptTimeoutEnabled: true,
  acceptTimeoutSeconds: 10,
  onTimeout: 'close_no_winner',
  preAcceptDelayMs: 0,
  startCooldownEnabled: false,
  startCooldownSeconds: 30,
  autoSeriesEnabled: false,
  autoSeriesLength: 1,
  announceWinnerInChat: true,
  winnerOverlaySeconds: 8,
  roleSettings: DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
};

function parseRoleSettingsFromFirstReaction(
  raw: unknown,
): ChatRollRoleSettings {
  if (!raw || typeof raw !== 'object') {
    return FIRST_REACTION_DEFAULT_SETTINGS.roleSettings;
  }
  const record = raw as Record<string, unknown>;
  if (
    record.channel_follower &&
    typeof record.channel_follower === 'object' &&
    record.viewer === undefined
  ) {
    record.viewer = record.channel_follower;
  }
  delete record.channel_follower;
  const normalized = normalizeRoleSettings(record);
  return normalized ?? FIRST_REACTION_DEFAULT_SETTINGS.roleSettings;
}

export function parseFirstReactionSettings(raw: unknown): FirstReactionSettings {
  const base = { ...FIRST_REACTION_DEFAULT_SETTINGS };
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const input = raw as Record<string, unknown>;

  const wordSource =
    input.wordSource === 'generated' ? 'generated' : 'manual';
  const manualScope =
    input.manualScope === 'per_session' ? 'per_session' : 'per_draw';

  let generationPool: FirstReactionGenerationPool = 'builtin_casino';
  if (input.generationPool === 'builtin_general') {
    generationPool = 'builtin_general';
  } else if (input.generationPool === 'custom_list') {
    generationPool = 'custom_list';
  }

  const customWords = Array.isArray(input.customWords)
    ? input.customWords
        .map((w) => normalizeKeywordToken(String(w)))
        .filter((w) => w.length > 0)
    : base.customWords;

  const acceptTimeoutSeconds = clampInt(
    input.acceptTimeoutSeconds,
    5,
    120,
    base.acceptTimeoutSeconds,
  );
  const startCooldownSeconds = clampInt(
    input.startCooldownSeconds,
    0,
    300,
    base.startCooldownSeconds,
  );
  const preAcceptDelayMs = clampInt(
    input.preAcceptDelayMs,
    0,
    5000,
    base.preAcceptDelayMs,
  );
  const autoSeriesLength = clampInt(
    input.autoSeriesLength,
    1,
    10,
    base.autoSeriesLength,
  );
  const winnerOverlaySeconds = clampInt(
    input.winnerOverlaySeconds,
    3,
    30,
    base.winnerOverlaySeconds,
  );

  const sessionKeywordRaw =
    typeof input.sessionKeyword === 'string'
      ? normalizeKeywordToken(input.sessionKeyword)
      : null;

  return {
    wordSource,
    manualScope,
    sessionKeyword:
      sessionKeywordRaw && sessionKeywordRaw.length > 0
        ? sessionKeywordRaw
        : null,
    generationPool,
    customWords,
    avoidRepeatUntilPoolExhausted:
      input.avoidRepeatUntilPoolExhausted !== false,
    acceptTimeoutEnabled: input.acceptTimeoutEnabled !== false,
    acceptTimeoutSeconds,
    onTimeout: 'close_no_winner',
    preAcceptDelayMs,
    startCooldownEnabled: input.startCooldownEnabled === true,
    startCooldownSeconds,
    autoSeriesEnabled: input.autoSeriesEnabled === true,
    autoSeriesLength,
    announceWinnerInChat: input.announceWinnerInChat !== false,
    winnerOverlaySeconds,
    roleSettings: parseRoleSettingsFromFirstReaction(input.roleSettings),
  };
}

export function mergeFirstReactionSettingsPatch(
  current: FirstReactionSettings,
  patch: Record<string, unknown>,
): FirstReactionSettings {
  return parseFirstReactionSettings({ ...current, ...patch });
}

export function normalizeKeywordToken(value: string): string {
  return value.trim().toLowerCase().replace(/^!+/, '');
}

export function commandMatchesKeyword(
  messageContent: string,
  keyword: string,
): boolean {
  const messageToken = normalizeKeywordToken(messageContent);
  const keywordToken = normalizeKeywordToken(keyword);
  return (
    messageToken.length > 0 &&
    keywordToken.length > 0 &&
    messageToken === keywordToken
  );
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

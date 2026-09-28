import { describe, expect, it } from 'vitest';
import {
  mapKickBadgesToRoleIds,
  resolveKickChatRollRoleIds,
} from './kick-badge.mapper.js';

describe('mapKickBadgesToRoleIds', () => {
  it('maps known badge types', () => {
    expect(
      mapKickBadgesToRoleIds([
        { type: 'moderator' },
        { type: 'subscriber' },
        { type: 'vip' },
      ]),
    ).toEqual(['moderator', 'paid_subscriber', 'vip']);
  });

  it('falls back to badge text', () => {
    expect(mapKickBadgesToRoleIds([{ text: 'Moderator' }])).toEqual([
      'moderator',
    ]);
  });

  it('returns empty array when no badges', () => {
    expect(mapKickBadgesToRoleIds(undefined)).toEqual([]);
  });
});

describe('resolveKickChatRollRoleIds', () => {
  it('assigns viewer when no mapped badges', () => {
    expect(resolveKickChatRollRoleIds([])).toEqual(['viewer']);
    expect(resolveKickChatRollRoleIds(undefined)).toEqual(['viewer']);
  });

  it('keeps badge roles without viewer', () => {
    expect(
      resolveKickChatRollRoleIds([{ type: 'moderator', text: 'Moderator' }]),
    ).toEqual(['moderator']);
  });
});

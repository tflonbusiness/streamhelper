import { describe, expect, it } from 'vitest';
import { mapKickBadgesToRoleIds } from './kick-badge.mapper.js';

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

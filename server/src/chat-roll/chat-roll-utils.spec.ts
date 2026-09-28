import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
  canJoinChatRollWithRoles,
} from './chat-roll-utils.js';

describe('canJoinChatRollWithRoles', () => {
  it('allows when user has an enabled role', () => {
    expect(
      canJoinChatRollWithRoles(['viewer'], DEFAULT_CHAT_ROLL_ROLE_SETTINGS),
    ).toBe(true);
    expect(
      canJoinChatRollWithRoles(
        ['paid_subscriber'],
        DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
      ),
    ).toBe(true);
  });

  it('rejects when user roles are all disabled in session', () => {
    const roles = {
      ...DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
      viewer: { enabled: false, weight: 1 },
      paid_subscriber: { enabled: false, weight: 2 },
    };
    expect(canJoinChatRollWithRoles(['viewer'], roles)).toBe(false);
    expect(canJoinChatRollWithRoles(['moderator'], roles)).toBe(false);
  });

  it('rejects unknown role ids with no enabled match', () => {
    const roles = {
      ...DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
      viewer: { enabled: false, weight: 1 },
    };
    expect(canJoinChatRollWithRoles(['unknown_badge'], roles)).toBe(false);
  });
});

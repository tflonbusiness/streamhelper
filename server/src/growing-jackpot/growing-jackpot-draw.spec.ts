import { DEFAULT_CHAT_ROLL_ROLE_SETTINGS } from '../chat-roll/chat-roll-utils.js';
import { pickGrowingJackpotWinner } from './growing-jackpot-draw.js';

describe('pickGrowingJackpotWinner', () => {
  it('picks deterministically from seed', () => {
    const participants = [
      { id: 1, roleIds: ['viewer'] },
      { id: 2, roleIds: ['viewer'] },
      { id: 3, roleIds: ['viewer'] },
    ];
    const first = pickGrowingJackpotWinner(
      participants,
      DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
      'highest',
      'test-seed-fixed',
    );
    const second = pickGrowingJackpotWinner(
      participants,
      DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
      'highest',
      'test-seed-fixed',
    );
    expect(first?.winner.id).toBe(second?.winner.id);
    expect(first?.seed).toBe('test-seed-fixed');
  });

  it('returns null for empty pool', () => {
    expect(
      pickGrowingJackpotWinner(
        [],
        DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
        'highest',
        'seed',
      ),
    ).toBeNull();
  });
});

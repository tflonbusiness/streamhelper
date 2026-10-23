import { describe, expect, it, vi } from 'vitest';
import { flushGrowingJackpotWinnerChatAnnouncements } from './growing-jackpot-winner-announce.js';

describe('flushGrowingJackpotWinnerChatAnnouncements', () => {
  it('sends chat message when announcement is enabled', async () => {
    const sendGrowingJackpotWinner = vi.fn(async () => undefined);
    const poolQuery = vi.fn(async (sql: string) => {
      if (sql.includes('winner_chat_announced = false')) {
        return {
          rows: [
            {
              id: 9,
              growing_jackpot_id: 2,
              winner_display_name: 'lucky',
              proof_token: 'WIN-ABCDEF12',
              settings_snapshot: {},
            },
          ],
        };
      }
      if (sql.includes('SET winner_chat_announced = true')) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    const growingJackpot = {
      getRoundWinnerAnnouncement: vi.fn(async () => ({
        displayName: 'lucky',
        proofToken: 'WIN-ABCDEF12',
        announceInChat: true,
      })),
    };

    await flushGrowingJackpotWinnerChatAnnouncements({
      database: { getPool: () => ({ query: poolQuery }) } as never,
      growingJackpot: growingJackpot as never,
      chatReply: { sendGrowingJackpotWinner } as never,
      accountId: 10,
      broadcasterUserId: 'channel-1',
    });

    expect(sendGrowingJackpotWinner).toHaveBeenCalledWith({
      broadcasterUserId: 'channel-1',
      displayName: 'lucky',
      proofToken: 'WIN-ABCDEF12',
    });
    expect(poolQuery).toHaveBeenCalledTimes(2);
  });

  it('marks announced without chat when disabled in settings', async () => {
    const sendGrowingJackpotWinner = vi.fn(async () => undefined);
    const poolQuery = vi.fn(async (sql: string) => {
      if (sql.includes('winner_chat_announced = false')) {
        return {
          rows: [
            {
              id: 3,
              growing_jackpot_id: 1,
              winner_display_name: 'quiet',
              proof_token: 'WIN-00000000',
              settings_snapshot: {},
            },
          ],
        };
      }
      if (sql.includes('SET winner_chat_announced = true')) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    await flushGrowingJackpotWinnerChatAnnouncements({
      database: { getPool: () => ({ query: poolQuery }) } as never,
      growingJackpot: {
        getRoundWinnerAnnouncement: vi.fn(async () => ({
          displayName: 'quiet',
          proofToken: 'WIN-00000000',
          announceInChat: false,
        })),
      } as never,
      chatReply: { sendGrowingJackpotWinner } as never,
      accountId: 10,
      broadcasterUserId: 'channel-1',
    });

    expect(sendGrowingJackpotWinner).not.toHaveBeenCalled();
    expect(poolQuery).toHaveBeenCalledTimes(2);
  });

  it('does nothing when no pending rounds', async () => {
    const sendGrowingJackpotWinner = vi.fn(async () => undefined);
    const poolQuery = vi.fn(async () => ({ rows: [] }));

    await flushGrowingJackpotWinnerChatAnnouncements({
      database: { getPool: () => ({ query: poolQuery }) } as never,
      growingJackpot: {
        getRoundWinnerAnnouncement: vi.fn(),
      } as never,
      chatReply: { sendGrowingJackpotWinner } as never,
      accountId: 10,
      broadcasterUserId: 'channel-1',
    });

    expect(sendGrowingJackpotWinner).not.toHaveBeenCalled();
    expect(poolQuery).toHaveBeenCalledTimes(1);
  });
});

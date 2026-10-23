import type { DatabaseService } from '../database/database.service.js';
import type { KickChatReplyService } from '../kick-chat/kick-chat-reply.service.js';
import type { GrowingJackpotService } from './growing-jackpot.service.js';

export async function flushGrowingJackpotWinnerChatAnnouncements(input: {
  database: DatabaseService;
  growingJackpot: GrowingJackpotService;
  chatReply: KickChatReplyService;
  accountId: number;
  broadcasterUserId: string;
}): Promise<void> {
  const pool = input.database.getPool();
  const pending = await pool.query<{
    id: number;
    growing_jackpot_id: number;
    winner_display_name: string;
    proof_token: string;
    settings_snapshot: unknown;
  }>(
    `
      SELECT r.id, r.growing_jackpot_id, r.winner_display_name, r.proof_token, r.settings_snapshot
      FROM growing_jackpot_round r
      INNER JOIN growing_jackpot gj ON gj.id = r.growing_jackpot_id
      WHERE gj.account_id = $1
        AND r.result = 'won'
        AND r.winner_chat_announced = false
        AND r.proof_token IS NOT NULL
    `,
    [input.accountId],
  );

  for (const row of pending.rows) {
    const announcement = await input.growingJackpot.getRoundWinnerAnnouncement(
      Number(row.growing_jackpot_id),
      Number(row.id),
    );
    if (!announcement?.announceInChat) {
      await pool.query(
        `
          UPDATE growing_jackpot_round
          SET winner_chat_announced = true
          WHERE id = $1
        `,
        [row.id],
      );
      continue;
    }

    await input.chatReply.sendGrowingJackpotWinner({
      broadcasterUserId: input.broadcasterUserId,
      displayName: announcement.displayName,
      proofToken: announcement.proofToken,
    });

    await pool.query(
      `
        UPDATE growing_jackpot_round
        SET winner_chat_announced = true
        WHERE id = $1
      `,
      [row.id],
    );
  }
}

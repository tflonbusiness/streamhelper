import { GROWING_JACKPOT_DEFAULT_SETTINGS } from '../../src/growing-jackpot/growing-jackpot-settings.js';
import { GROWING_JACKPOT_WIDGET_DEFAULTS } from '../../src/growing-jackpot/growing-jackpot-widget-defaults.js';
import { GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS } from '../../src/growing-jackpot/growing-jackpot-widget-style.js';
import {
  activeTrialSubscriptionFixture,
  subscriptionDatabaseMocks,
} from '../../src/subscriptions/account-subscription-fixtures.js';

type JackpotRow = {
  id: number;
  account_id: number;
  created_by_user_id: number;
  title: string;
  status: 'live' | 'off_air' | 'archived';
  settings: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  created_by_name?: string;
};

type RoundRow = {
  id: number;
  growing_jackpot_id: number;
  round_index: number;
  join_keyword: string;
  settings_snapshot: Record<string, unknown>;
  phase: 'accepting' | 'drawing' | 'closed';
  result: string | null;
  ends_at: Date;
  participant_count: number;
  display_prize: number;
  closed_at: Date | null;
  winner_participant_id: number | null;
  winner_provider: string | null;
  winner_provider_user_id: string | null;
  winner_display_name: string | null;
  rng_seed: string | null;
  proof_token: string | null;
  fulfillment_status: string;
  started_by_user_id: number;
  created_at: Date;
  stopped_by_user_id?: number | null;
  winner_chat_announced?: boolean;
};

type ParticipantRow = {
  id: number;
  round_id: number;
  provider: string;
  provider_user_id: string;
  display_name: string;
  role_ids: string[];
};

type WidgetRow = {
  account_id: number;
  width: number;
  height: number;
  style: Record<string, unknown>;
};

function norm(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim().toLowerCase();
}

export class GrowingJackpotInMemoryDb {
  private nextJackpotId = 1;
  private nextRoundId = 1;
  private nextParticipantId = 1;

  readonly jackpots: JackpotRow[] = [];
  readonly rounds: RoundRow[] = [];
  readonly participants: ParticipantRow[] = [];
  readonly widgets = new Map<number, WidgetRow>();

  readonly users = new Map<number, { id: number; name: string }>([
    [1, { id: 1, name: 'demo_streamer' }],
  ]);

  readonly pool = {
    query: (text: string, params: unknown[] = []) =>
      this.query(text, params),
    connect: async () => ({
      query: (text: string, params: unknown[] = []) =>
        this.query(text, params),
      release: () => undefined,
    }),
  };

  expireRound(roundId: number): void {
    const round = this.rounds.find((r) => r.id === roundId);
    if (round) {
      round.ends_at = new Date(Date.now() - 60_000);
    }
  }

  addParticipant(
    roundId: number,
    providerUserId: string,
    displayName: string,
  ): void {
    const round = this.rounds.find((r) => r.id === roundId);
    if (!round) {
      throw new Error(`Round ${roundId} not found`);
    }
    this.participants.push({
      id: this.nextParticipantId++,
      round_id: roundId,
      provider: 'kick',
      provider_user_id: providerUserId,
      display_name: displayName,
      role_ids: ['viewer'],
    });
    round.participant_count += 1;
    round.display_prize = round.participant_count;
  }

  private query(text: string, params: unknown[]) {
    const sql = norm(text);

    if (sql === 'begin' || sql === 'commit' || sql === 'rollback') {
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    if (sql.includes('insert into growing_jackpot_widget')) {
      const accountId = Number(params[0]);
      if (!this.widgets.has(accountId)) {
        this.widgets.set(accountId, {
          account_id: accountId,
          width: GROWING_JACKPOT_WIDGET_DEFAULTS.width,
          height: GROWING_JACKPOT_WIDGET_DEFAULTS.height,
          style: { ...GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS },
        });
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('select exists') &&
      sql.includes('from growing_jackpot') &&
      sql.includes('has_live')
    ) {
      const accountId = Number(params[0]);
      const hasLive = this.jackpots.some(
        (j) => j.account_id === accountId && j.status === 'live',
      );
      return Promise.resolve({ rows: [{ has_live: hasLive }] });
    }

    if (sql.includes('insert into growing_jackpot_round')) {
      const [
        growingJackpotId,
        roundIndex,
        joinKeyword,
        settingsSnapshot,
        timerSeconds,
        displayPrize,
        startedByUserId,
      ] = params as [number, number, string, string, number, number, number];
      const row: RoundRow = {
        id: this.nextRoundId++,
        growing_jackpot_id: growingJackpotId,
        round_index: roundIndex,
        join_keyword: joinKeyword,
        settings_snapshot: JSON.parse(settingsSnapshot) as Record<string, unknown>,
        phase: 'accepting',
        result: null,
        ends_at: new Date(Date.now() + timerSeconds * 1000),
        participant_count: 0,
        display_prize: displayPrize,
        closed_at: null,
        winner_participant_id: null,
        winner_provider: null,
        winner_provider_user_id: null,
        winner_display_name: null,
        rng_seed: null,
        proof_token: null,
        fulfillment_status: 'pending',
        started_by_user_id: startedByUserId,
        created_at: new Date(),
        winner_chat_announced: false,
      };
      this.rounds.push(row);
      return Promise.resolve({ rows: [row], rowCount: 1 });
    }

    if (
      sql.includes('insert into growing_jackpot (') ||
      sql.includes('insert into growing_jackpot\n')
    ) {
      const [accountId, userId, title, status] = params as [
        number,
        number,
        string,
        JackpotRow['status'],
      ];
      const row: JackpotRow = {
        id: this.nextJackpotId++,
        account_id: accountId,
        created_by_user_id: userId,
        title,
        status,
        settings: { ...GROWING_JACKPOT_DEFAULT_SETTINGS },
        created_at: new Date(),
        updated_at: new Date(),
        created_by_name: this.users.get(userId)?.name ?? '',
      };
      this.jackpots.push(row);
      return Promise.resolve({ rows: [{ id: row.id }], rowCount: 1 });
    }

    if (
      sql.includes('count(*)') &&
      sql.includes('from growing_jackpot gj') &&
      !sql.includes('inner join')
    ) {
      const accountId = Number(params[0]);
      let rows = this.jackpots.filter((j) => j.account_id === accountId);
      if (sql.includes("status = 'archived'")) {
        rows = rows.filter((j) => j.status === 'archived');
      } else if (sql.includes("status != 'archived'")) {
        rows = rows.filter((j) => j.status !== 'archived');
      }
      return Promise.resolve({
        rows: [{ count: String(rows.length) }],
      });
    }

    if (
      sql.includes('from growing_jackpot gj') &&
      sql.includes('inner join users')
    ) {
      const accountId = Number(params[0]);
      const jackpotId =
        params.length >= 2 && sql.includes('gj.id = $2')
          ? Number(params[1])
          : null;
      let rows = this.jackpots.filter((j) => j.account_id === accountId);
      if (jackpotId !== null) {
        rows = rows.filter((j) => j.id === jackpotId);
      }
      if (sql.includes("status = 'archived'")) {
        rows = rows.filter((j) => j.status === 'archived');
      } else if (sql.includes("status != 'archived'")) {
        rows = rows.filter((j) => j.status !== 'archived');
      }
      if (sql.includes('order by gj.created_at desc')) {
        rows = [...rows].sort(
          (a, b) => b.created_at.getTime() - a.created_at.getTime(),
        );
      }
      if (sql.includes('limit $2 offset $3')) {
        const limit = Number(params[1]);
        const offset = Number(params[2]);
        rows = rows.slice(offset, offset + limit);
      }
      return Promise.resolve({
        rows: rows.map((j) => this.hydrateJackpot(j)),
      });
    }

    if (
      sql.includes('update growing_jackpot') &&
      sql.includes("set status = 'live'")
    ) {
      const accountId = Number(params[0]);
      const id = Number(params[1]);
      const row = this.jackpots.find(
        (j) => j.account_id === accountId && j.id === id && j.status === 'off_air',
      );
      if (!row) {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      row.status = 'live';
      row.updated_at = new Date();
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('update growing_jackpot') &&
      sql.includes("set status = 'off_air'")
    ) {
      const accountId = Number(params[0]);
      const id = Number(params[1]);
      const row = this.jackpots.find(
        (j) => j.account_id === accountId && j.id === id && j.status === 'live',
      );
      if (!row) {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      row.status = 'off_air';
      row.updated_at = new Date();
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('update growing_jackpot') &&
      sql.includes("set status = 'archived'")
    ) {
      const accountId = Number(params[0]);
      const id = Number(params[1]);
      const row = this.jackpots.find(
        (j) => j.account_id === accountId && j.id === id,
      );
      if (row && row.status !== 'archived') {
        row.status = 'archived';
        row.updated_at = new Date();
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('update growing_jackpot') &&
      sql.includes('title =') &&
      !sql.includes('settings =')
    ) {
      const accountId = Number(params[params.length - 2]);
      const id = Number(params[params.length - 1]);
      const title = String(params[0]);
      const row = this.jackpots.find(
        (j) => j.account_id === accountId && j.id === id,
      );
      if (row) {
        row.title = title;
        row.updated_at = new Date();
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (sql.includes('update growing_jackpot') && sql.includes('settings =')) {
      const accountId = Number(params[params.length - 2]);
      const id = Number(params[params.length - 1]);
      const row = this.jackpots.find(
        (j) => j.account_id === accountId && j.id === id,
      );
      if (row) {
        const settingsJson = params.find(
          (p) => typeof p === 'string' && p.includes('joinKeyword'),
        );
        if (typeof settingsJson === 'string') {
          row.settings = JSON.parse(settingsJson) as Record<string, unknown>;
        }
        const title = params.find(
          (p) => typeof p === 'string' && !String(p).includes('joinKeyword'),
        );
        if (typeof title === 'string' && title.length <= 120) {
          row.title = title;
        }
        row.updated_at = new Date();
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('select id from growing_jackpot') &&
      sql.includes("status = 'live'")
    ) {
      const accountId = Number(params[0]);
      const live = this.jackpots
        .filter((j) => j.account_id === accountId && j.status === 'live')
        .sort((a, b) => b.id - a.id)[0];
      return Promise.resolve({ rows: live ? [{ id: live.id }] : [] });
    }

    if (
      sql.includes('from growing_jackpot_round') &&
      sql.includes("phase in ('accepting', 'drawing')")
    ) {
      const jackpotId = Number(params[0]);
      const active = this.rounds
        .filter(
          (r) =>
            r.growing_jackpot_id === jackpotId &&
            (r.phase === 'accepting' || r.phase === 'drawing'),
        )
        .sort((a, b) => b.id - a.id)[0];
      return Promise.resolve({ rows: active ? [active] : [] });
    }

    if (
      sql.includes('select id from growing_jackpot_round') &&
      sql.includes("phase in ('accepting', 'drawing')") &&
      sql.includes('limit 1')
    ) {
      const jackpotId = Number(params[0]);
      const active = this.rounds.find(
        (r) =>
          r.growing_jackpot_id === jackpotId &&
          (r.phase === 'accepting' || r.phase === 'drawing'),
      );
      return Promise.resolve({ rows: active ? [{ id: active.id }] : [] });
    }

    if (sql.includes('count(*)') && sql.includes('growing_jackpot_round')) {
      const jackpotId = Number(params[0]);
      const count = this.rounds.filter(
        (r) => r.growing_jackpot_id === jackpotId,
      ).length;
      return Promise.resolve({ rows: [{ count: String(count) }] });
    }

    if (
      sql.includes('from growing_jackpot_round') &&
      sql.includes('phase = \'accepting\'') &&
      sql.includes('join_keyword')
    ) {
      const jackpotId = Number(params[0]);
      const round = this.rounds
        .filter(
          (r) => r.growing_jackpot_id === jackpotId && r.phase === 'accepting',
        )
        .sort((a, b) => b.id - a.id)[0];
      if (!round) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({
        rows: [
          {
            id: round.id,
            join_keyword: round.join_keyword,
            settings_snapshot: round.settings_snapshot,
          },
        ],
      });
    }

    if (
      sql.includes('from growing_jackpot_round') &&
      sql.includes('for update')
    ) {
      const roundId = Number(params[0]);
      const jackpotId = Number(params[1]);
      const round = this.rounds.find(
        (r) => r.id === roundId && r.growing_jackpot_id === jackpotId,
      );
      return Promise.resolve({ rows: round ? [round] : [] });
    }

    if (sql.includes('insert into growing_jackpot_participant')) {
      const [roundId, provider, providerUserId, displayName, roleIds] =
        params as [number, string, string, string, string[]];
      const exists = this.participants.some(
        (p) =>
          p.round_id === roundId &&
          p.provider === provider &&
          p.provider_user_id === providerUserId,
      );
      if (exists) {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      const row: ParticipantRow = {
        id: this.nextParticipantId++,
        round_id: roundId,
        provider,
        provider_user_id: providerUserId,
        display_name: displayName,
        role_ids: roleIds,
      };
      this.participants.push(row);
      return Promise.resolve({ rows: [{ id: row.id }], rowCount: 1 });
    }

    if (
      sql.includes('update growing_jackpot_round') &&
      sql.includes('participant_count =')
    ) {
      const [newCount, displayPrize, roundId] = params as [number, number, number];
      const round = this.rounds.find((r) => r.id === roundId);
      if (round) {
        round.participant_count = newCount;
        round.display_prize = displayPrize;
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes("set phase = 'drawing'") &&
      sql.includes('growing_jackpot_round')
    ) {
      const roundId = Number(params[0]);
      const round = this.rounds.find((r) => r.id === roundId);
      if (round) {
        round.phase = 'drawing';
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes("result = 'no_participants'") &&
      sql.includes('growing_jackpot_round')
    ) {
      const roundId = Number(params[0]);
      const round = this.rounds.find((r) => r.id === roundId);
      if (round) {
        round.phase = 'closed';
        round.result = 'no_participants';
        round.closed_at = new Date();
        round.fulfillment_status = 'not_applicable';
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes("result = 'stopped'") &&
      sql.includes('growing_jackpot_round')
    ) {
      const roundId = Number(params[0]);
      const stoppedBy = params[1] as number | null;
      const round = this.rounds.find((r) => r.id === roundId);
      if (round) {
        round.phase = 'closed';
        round.result = 'stopped';
        round.closed_at = new Date();
        round.fulfillment_status = 'not_applicable';
        round.stopped_by_user_id = stoppedBy;
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('proof_token =') &&
      sql.includes('growing_jackpot_round')
    ) {
      const [roundId, winnerParticipantId, seed, proofToken] = params as [
        number,
        number,
        string,
        string,
      ];
      const round = this.rounds.find((r) => r.id === roundId);
      const winner = this.participants.find((p) => p.id === winnerParticipantId);
      if (round && winner) {
        round.phase = 'closed';
        round.result = 'won';
        round.closed_at = new Date();
        round.winner_participant_id = winnerParticipantId;
        round.winner_provider = 'kick';
        round.winner_provider_user_id = winner.provider_user_id;
        round.winner_display_name = winner.display_name;
        round.rng_seed = seed;
        round.proof_token = proofToken;
        round.fulfillment_status = 'pending';
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('from growing_jackpot_participant') &&
      sql.includes('where round_id')
    ) {
      const roundId = Number(params[0]);
      const rows = this.participants
        .filter((p) => p.round_id === roundId)
        .sort((a, b) => a.id - b.id)
        .map((p) => ({ id: p.id, role_ids: p.role_ids }));
      return Promise.resolve({ rows });
    }

    if (
      sql.includes('select id') &&
      sql.includes('growing_jackpot_round') &&
      sql.includes('ends_at <= now()')
    ) {
      const jackpotId = params[0] !== undefined ? Number(params[0]) : null;
      const due = this.rounds.filter((r) => {
        if (r.phase !== 'accepting' || r.ends_at > new Date()) {
          return false;
        }
        if (jackpotId !== null) {
          return r.growing_jackpot_id === jackpotId;
        }
        return true;
      });
      return Promise.resolve({
        rows: due.map((r) => ({
          id: r.id,
          growing_jackpot_id: r.growing_jackpot_id,
        })),
      });
    }

    if (
      sql.includes('select *') &&
      sql.includes('from growing_jackpot_round') &&
      sql.includes('growing_jackpot_id = $1 and id = $2')
    ) {
      const jackpotId = Number(params[0]);
      const roundId = Number(params[1]);
      const round = this.rounds.find(
        (r) => r.growing_jackpot_id === jackpotId && r.id === roundId,
      );
      return Promise.resolve({ rows: round ? [round] : [] });
    }

    if (
      sql.includes('select *') &&
      sql.includes('from growing_jackpot_round') &&
      sql.includes('order by created_at desc')
    ) {
      const jackpotId = Number(params[0]);
      const limit = Number(params[1]);
      const offset = Number(params[2]);
      const rows = this.rounds
        .filter((r) => r.growing_jackpot_id === jackpotId)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(offset, offset + limit);
      return Promise.resolve({ rows });
    }

    if (
      sql.includes('select width, height') &&
      sql.includes('growing_jackpot_widget')
    ) {
      const accountId = Number(params[0]);
      const widget = this.widgets.get(accountId);
      return Promise.resolve({
        rows: widget
          ? [
              {
                width: widget.width,
                height: widget.height,
                style: widget.style,
              },
            ]
          : [],
      });
    }

    if (sql.includes('update growing_jackpot_widget')) {
      const accountId = Number(params[params.length - 1]);
      const widget = this.widgets.get(accountId) ?? {
        account_id: accountId,
        width: GROWING_JACKPOT_WIDGET_DEFAULTS.width,
        height: GROWING_JACKPOT_WIDGET_DEFAULTS.height,
        style: { ...GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS },
      };
      const numbers = params.slice(0, -1).filter(
        (p): p is number => typeof p === 'number',
      );
      if (numbers[0] !== undefined) {
        widget.width = numbers[0];
      }
      if (numbers[1] !== undefined) {
        widget.height = numbers[1];
      }
      const styleJson = params.find(
        (p) => typeof p === 'string' && p.startsWith('{'),
      );
      if (typeof styleJson === 'string') {
        widget.style = JSON.parse(styleJson) as Record<string, unknown>;
      }
      this.widgets.set(accountId, widget);
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('update growing_jackpot_round') &&
      sql.includes('fulfillment_status =')
    ) {
      const [status, , roundId, jackpotId, accountId] = params as [
        string,
        number,
        number,
        number,
        number,
      ];
      const jackpot = this.jackpots.find(
        (j) => j.id === jackpotId && j.account_id === accountId,
      );
      const round = this.rounds.find(
        (r) => r.id === roundId && r.growing_jackpot_id === jackpotId,
      );
      if (!jackpot || !round || round.result !== 'won') {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      round.fulfillment_status = status;
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('winner_chat_announced = false') &&
      sql.includes('inner join growing_jackpot')
    ) {
      const accountId = Number(params[0]);
      const rows = this.rounds
        .filter((r) => {
          const jackpot = this.jackpots.find(
            (j) => j.id === r.growing_jackpot_id && j.account_id === accountId,
          );
          return (
            jackpot &&
            r.result === 'won' &&
            r.winner_chat_announced !== true &&
            r.proof_token
          );
        })
        .map((r) => ({
          id: r.id,
          growing_jackpot_id: r.growing_jackpot_id,
          winner_display_name: r.winner_display_name,
          proof_token: r.proof_token,
          settings_snapshot: r.settings_snapshot,
        }));
      return Promise.resolve({ rows });
    }

    if (sql.includes('set winner_chat_announced = true')) {
      const roundId = Number(params[0]);
      const round = this.rounds.find((r) => r.id === roundId);
      if (round) {
        round.winner_chat_announced = true;
      }
      return Promise.resolve({ rows: [], rowCount: 1 });
    }

    if (
      sql.includes('select *') &&
      sql.includes('from growing_jackpot_round') &&
      sql.includes('order by id desc') &&
      sql.includes('limit 1')
    ) {
      const jackpotId = Number(params[0]);
      const round = this.rounds
        .filter((r) => r.growing_jackpot_id === jackpotId)
        .sort((a, b) => b.id - a.id)[0];
      return Promise.resolve({ rows: round ? [round] : [] });
    }

    throw new Error(`Unhandled growing jackpot SQL: ${sql.slice(0, 120)}`);
  }

  private hydrateJackpot(row: JackpotRow) {
    return {
      ...row,
      settings: row.settings,
      created_by_name: row.created_by_name ?? '',
    };
  }
}

export type GrowingJackpotDatabaseMockOptions = {
  accountHasSubscriptionAccess?: (accountId: number) => Promise<boolean>;
};

export function growingJackpotDatabaseMocks(
  store: GrowingJackpotInMemoryDb,
  accountId = 10,
  options: GrowingJackpotDatabaseMockOptions = {},
) {
  return {
    ...subscriptionDatabaseMocks,
    accountHasSubscriptionAccess:
      options.accountHasSubscriptionAccess ??
      subscriptionDatabaseMocks.accountHasSubscriptionAccess,
    onModuleInit: async () => undefined,
    onModuleDestroy: async () => undefined,
    hasActiveCredentials: async () => true,
    findUserById: async (userId: number) =>
      userId === 1 ? { id: 1, name: 'demo_streamer' } : null,
    getPrimaryMembership: async (userId: number) =>
      userId === 1
        ? {
            accountId,
            name: 'demo_streamer',
            role: 'owner' as const,
            subscriptionPlan: 'free',
            ucid: '550e8400-e29b-41d4-a716-446655440000',
            subscription: activeTrialSubscriptionFixture(),
          }
        : null,
    hasActiveMembership: async (accId: number, userId: number) =>
      accId === accountId && userId === 1,
    getPool: () => store.pool,
    getAccountIdByUcid: async (ucid: string) =>
      ucid === '550e8400-e29b-41d4-a716-446655440000' ? accountId : null,
    getKickChannelIdByAccountId: async (accId: number) =>
      accId === accountId ? 'channel-mock' : null,
    getPrimaryKickChannel: async (accId: number) =>
      accId === accountId
        ? { channelId: 'channel-mock', channelSlug: 'kick_user_mock' }
        : null,
    provisionOwnerFromKick: async () => ({
      userId: 1,
      membership: {
        accountId,
        name: 'demo_streamer',
        role: 'owner' as const,
        subscriptionPlan: 'free',
        ucid: '550e8400-e29b-41d4-a716-446655440000',
        subscription: activeTrialSubscriptionFixture(),
      },
    }),
    findCredentialByProvider: async (provider: string, providerUserId: string) =>
      provider === 'kick' && providerUserId === 'kick-mock-user'
        ? { userId: 1, isActive: true }
        : null,
  };
}

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service.js';
import { GROWING_JACKPOT_DEFAULT_SETTINGS } from './growing-jackpot-settings.js';
import {
  GrowingJackpotInMemoryDb,
  growingJackpotDatabaseMocks,
} from '../../test/fixtures/growing-jackpot-in-memory-db.js';
import { GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS } from './growing-jackpot-widget-style.js';
import { GrowingJackpotService } from './growing-jackpot.service.js';

describe('GrowingJackpotService (in-memory)', () => {
  let service: GrowingJackpotService;
  let store: GrowingJackpotInMemoryDb;
  const accountId = 10;
  const userId = 1;

  beforeEach(async () => {
    store = new GrowingJackpotInMemoryDb();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrowingJackpotService,
        {
          provide: DatabaseService,
          useValue: growingJackpotDatabaseMocks(store, accountId),
        },
      ],
    }).compile();

    service = module.get(GrowingJackpotService);
    service.onModuleDestroy();
  });

  it('creates the first session as live', async () => {
    const { session } = await service.createSession(
      accountId,
      userId,
      'Friday jackpot',
    );
    expect(session.status).toBe('live');
    expect(session.title).toBe('Friday jackpot');
  });

  it('creates off_air when another session is already live', async () => {
    await service.createSession(accountId, userId, 'Live one');
    const { session } = await service.createSession(
      accountId,
      userId,
      'Second',
    );
    expect(session.status).toBe('off_air');
  });

  it('starts a round and grows display prize on join', async () => {
    const { session } = await service.createSession(accountId, userId, 'Pool');
    const { round } = await service.startRound(accountId, userId, session.id);
    expect(round.phase).toBe('accepting');

    const join = await service.tryJoinFromChat({
      accountId,
      growingJackpotId: session.id,
      roundId: round.id,
      provider: 'kick',
      providerUserId: 'u-1',
      displayName: 'alice',
      roleIds: ['viewer'],
    });
    expect(join).toEqual({
      status: 'created',
      participantCount: 1,
      displayPrize: 1,
    });

    const duplicate = await service.tryJoinFromChat({
      accountId,
      growingJackpotId: session.id,
      roundId: round.id,
      provider: 'kick',
      providerUserId: 'u-1',
      displayName: 'alice',
      roleIds: ['viewer'],
    });
    expect(duplicate).toEqual({ status: 'duplicate' });
  });

  it('closes expired round with no participants as no_participants', async () => {
    const { session } = await service.createSession(accountId, userId, 'Empty');
    const { round } = await service.startRound(accountId, userId, session.id);
    store.expireRound(round.id);

    await service.closeDueRoundsForJackpot(session.id);

    const closed = store.rounds.find((r) => r.id === round.id);
    expect(closed?.phase).toBe('closed');
    expect(closed?.result).toBe('no_participants');
  });

  it('draws a winner when round expires with participants', async () => {
    const { session } = await service.createSession(accountId, userId, 'Win');
    const { round } = await service.startRound(accountId, userId, session.id);
    await service.tryJoinFromChat({
      accountId,
      growingJackpotId: session.id,
      roundId: round.id,
      provider: 'kick',
      providerUserId: 'winner-1',
      displayName: 'lucky',
      roleIds: ['viewer'],
    });
    store.expireRound(round.id);
    await service.closeDueRoundsForJackpot(session.id);

    const closed = store.rounds.find((r) => r.id === round.id);
    expect(closed?.result).toBe('won');
    expect(closed?.proof_token).toMatch(/^WIN-/);
    expect(closed?.winner_display_name).toBe('lucky');
  });

  it('exposes public widget accepting state', async () => {
    const ucid = '550e8400-e29b-41d4-a716-446655440000';
    const { session } = await service.createSession(accountId, userId, 'OBS');
    await service.startRound(accountId, userId, session.id);

    const view = await service.getPublicWidgetByUcid(ucid);
    expect(view.status).toBe('accepting');
    if (view.status === 'accepting') {
      expect(view.joinKeyword).toBe('!join');
      expect(view.width).toBe(640);
      expect(view.height).toBe(176);
    }
  });

  it('patches widget dimensions and keeps default style', async () => {
    const widget = await service.patchWidget(accountId, userId, {
      width: 640,
      height: 360,
    });
    expect(widget).toEqual({
      width: 640,
      height: 360,
      style: GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS,
    });
  });

  it('patches widget style colors', async () => {
    const widget = await service.patchWidget(accountId, userId, {
      style: { prizeText: '#111111', timerText: '#222222' },
    });
    expect(widget.style.prizeText).toBe('#111111');
    expect(widget.style.timerText).toBe('#222222');
    expect(widget.style.keywordText).toBe(
      GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS.keywordText,
    );
  });

  it('goes live and deactivates off_air session', async () => {
    await service.createSession(accountId, userId, 'Live one');
    const { session: second } = await service.createSession(
      accountId,
      userId,
      'Second',
    );
    expect(second.status).toBe('off_air');

    const live = await service.goLive(accountId, userId, second.id);
    expect(live.session.status).toBe('live');

    const offAir = await service.deactivate(accountId, userId, second.id);
    expect(offAir.session.status).toBe('off_air');
  });

  it('archives session', async () => {
    const { session } = await service.createSession(accountId, userId, 'Old');
    await service.archiveSession(accountId, userId, session.id);
    const list = await service.listSessions(accountId, userId, 'true', 1, 20);
    expect(list.sessions.some((s) => s.id === session.id)).toBe(true);
  });

  it('exposes winner on public widget after draw', async () => {
    const ucid = '550e8400-e29b-41d4-a716-446655440000';
    const { session } = await service.createSession(accountId, userId, 'Show');
    const { round } = await service.startRound(accountId, userId, session.id);
    await service.tryJoinFromChat({
      accountId,
      growingJackpotId: session.id,
      roundId: round.id,
      provider: 'kick',
      providerUserId: 'p-1',
      displayName: 'hero',
      roleIds: ['viewer'],
    });
    store.expireRound(round.id);
    await service.closeDueRoundsForJackpot(session.id);

    const view = await service.getPublicWidgetByUcid(ucid);
    expect(view.status).toBe('winner');
    if (view.status === 'winner') {
      expect(view.round.winnerDisplayName).toBe('hero');
      expect(view.round.proofToken).toMatch(/^WIN-/);
    }
  });

  it('returns winner announcement metadata from closed round', async () => {
    const { session } = await service.createSession(accountId, userId, 'Ann');
    const { round } = await service.startRound(accountId, userId, session.id);
    await service.tryJoinFromChat({
      accountId,
      growingJackpotId: session.id,
      roundId: round.id,
      provider: 'kick',
      providerUserId: 'p-2',
      displayName: 'announced',
      roleIds: ['viewer'],
    });
    store.expireRound(round.id);
    await service.closeDueRoundsForJackpot(session.id);

    const announcement = await service.getRoundWinnerAnnouncement(
      session.id,
      round.id,
    );
    expect(announcement).toEqual({
      displayName: 'announced',
      proofToken: expect.stringMatching(/^WIN-/),
      announceInChat: true,
    });
  });

  it('matches join keyword like first-reaction commands', () => {
    expect(service.matchesKeyword('!join', '!join')).toBe(true);
    expect(service.matchesKeyword('  !JOIN  ', '!join')).toBe(true);
    expect(service.matchesKeyword('hello', '!join')).toBe(false);
  });

  it('creates proof tokens in WIN- format', () => {
    expect(GrowingJackpotService.createProofToken()).toMatch(/^WIN-[A-F0-9]{8}$/);
  });

  it('patches session title and settings', async () => {
    const { session } = await service.createSession(accountId, userId, 'Before');
    const updated = await service.patchSession(accountId, userId, session.id, {
      title: 'After title',
      settings: { joinKeyword: '!pool' },
    });
    expect(updated.session.title).toBe('After title');
    expect(updated.session.settings.joinKeyword).toBe('!pool');
    expect(updated.session.settings.timerSeconds).toBe(
      GROWING_JACKPOT_DEFAULT_SETTINGS.timerSeconds,
    );
  });

  it('lists rounds for a session', async () => {
    const { session } = await service.createSession(accountId, userId, 'History');
    const { round } = await service.startRound(accountId, userId, session.id);
    await service.stopRound(accountId, userId, session.id, round.id);

    const list = await service.listRounds(
      accountId,
      userId,
      session.id,
      1,
      10,
      'time',
      'desc',
    );
    expect(list.total).toBe(1);
    expect(list.rounds[0]?.result).toBe('stopped');
  });

  it('archives a closed round', async () => {
    const { session } = await service.createSession(accountId, userId, 'Archive');
    const { round } = await service.startRound(accountId, userId, session.id);
    await service.stopRound(accountId, userId, session.id, round.id);

    await service.archiveRound(accountId, userId, session.id, round.id);

    const list = await service.listRounds(
      accountId,
      userId,
      session.id,
      1,
      10,
      'time',
      'desc',
    );
    expect(list.total).toBe(0);
  });

  it('stops an accepting round without drawing', async () => {
    const { session } = await service.createSession(accountId, userId, 'Stop');
    const { round } = await service.startRound(accountId, userId, session.id);
    store.addParticipant(round.id, 'p-stop', 'player');

    const stopped = await service.stopRound(
      accountId,
      userId,
      session.id,
      round.id,
    );
    expect(stopped.round.result).toBe('stopped');
    expect(stopped.round.phase).toBe('closed');
    expect(stopped.round.winnerDisplayName).toBeNull();
  });

  it('returns intake context for live accepting round', async () => {
    const { session } = await service.createSession(accountId, userId, 'Chat');
    const { round } = await service.startRound(accountId, userId, session.id);

    const context = await service.getIntakeContext(accountId);
    expect(context).toEqual({
      growingJackpotId: session.id,
      roundId: round.id,
      joinKeyword: '!join',
      settings: expect.objectContaining({
        joinKeyword: '!join',
      }),
    });
  });

  it('exposes no_participants on public widget', async () => {
    const ucid = '550e8400-e29b-41d4-a716-446655440000';
    const { session } = await service.createSession(accountId, userId, 'Empty');
    const { round } = await service.startRound(accountId, userId, session.id);
    store.expireRound(round.id);

    const view = await service.getPublicWidgetByUcid(ucid);
    expect(view.status).toBe('no_participants');
    if (view.status === 'no_participants') {
      expect(view.round.id).toBe(round.id);
    }
  });

  it('closes due rounds via closeAllDueRounds', async () => {
    const { session } = await service.createSession(accountId, userId, 'Tick');
    const { round } = await service.startRound(accountId, userId, session.id);
    store.expireRound(round.id);

    await service.closeAllDueRounds();

    const closed = store.rounds.find((r) => r.id === round.id);
    expect(closed?.result).toBe('no_participants');
  });

  it('throws for unknown public widget account', async () => {
    await expect(
      service.getPublicWidgetByUcid('00000000-0000-0000-0000-000000000099'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('GrowingJackpotService subscription gate', () => {
  it('returns unavailable widget when subscription expired', async () => {
    const store = new GrowingJackpotInMemoryDb();
    const accountId = 10;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrowingJackpotService,
        {
          provide: DatabaseService,
          useValue: growingJackpotDatabaseMocks(store, accountId, {
            accountHasSubscriptionAccess: async () => false,
          }),
        },
      ],
    }).compile();
    const service = module.get(GrowingJackpotService);
    service.onModuleDestroy();

    const view = await service.getPublicWidgetByUcid(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    expect(view).toEqual({
      status: 'unavailable',
      reason: 'subscription_expired',
    });
  });
});

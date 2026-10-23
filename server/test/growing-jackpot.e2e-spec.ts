import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DatabaseService } from './../src/database/database.service.js';
import { KickChatReplyService } from './../src/kick-chat/kick-chat-reply.service.js';
import { GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS } from '../src/growing-jackpot/growing-jackpot-widget-style.js';
import {
  GrowingJackpotInMemoryDb,
  growingJackpotDatabaseMocks,
} from './fixtures/growing-jackpot-in-memory-db.js';

describe('Growing Jackpot (e2e)', () => {
  let app: INestApplication<App>;
  let store: GrowingJackpotInMemoryDb;
  let previousMockEnv: string | undefined;
  let winnerChatAnnouncements: Array<{
    broadcasterUserId: string;
    displayName: string;
    proofToken: string;
  }> = [];
  const accountId = 10;
  const ucid = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    previousMockEnv = process.env.KICK_OAUTH_MOCK;
    process.env.KICK_OAUTH_MOCK = 'true';
    store = new GrowingJackpotInMemoryDb();
    winnerChatAnnouncements = [];

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(growingJackpotDatabaseMocks(store, accountId))
      .overrideProvider(KickChatReplyService)
      .useValue({
        sendMessage: async () => undefined,
        sendGrowingJackpotWinner: async (input: {
          broadcasterUserId: string;
          displayName: string;
          proofToken: string;
        }) => {
          winnerChatAnnouncements.push(input);
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    if (previousMockEnv === undefined) {
      delete process.env.KICK_OAUTH_MOCK;
    } else {
      process.env.KICK_OAUTH_MOCK = previousMockEnv;
    }
  });

  async function loginOwner(agent: request.SuperAgentTest) {
    await agent.get('/auth/oauth/kick/callback?code=mock-kick-code');
  }

  it('creates session and returns idle public widget', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const create = await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Stream jackpot' })
      .expect(201);

    expect(create.body.session?.status ?? create.body.status).toBe('live');

    await request(app.getHttpServer())
      .get(`/growing-jackpots/widget/${ucid}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('idle');
        expect(body.width).toBe(640);
      });
  });

  it('starts round and shows accepting on public widget', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const create = await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Live pool' })
      .expect(201);
    const id = (create.body.session?.id ?? create.body.id) as number;

    await agent
      .post(`/accounts/${accountId}/growing-jackpots/${id}/rounds/start`)
      .expect(201);

    await request(app.getHttpServer())
      .get(`/growing-jackpots/widget/${ucid}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('accepting');
        expect(body.round.participantCount).toBe(0);
      });
  });

  it('patches account widget size and style', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .patch(`/accounts/${accountId}/growing-jackpot-widget`)
      .send({ width: 720, height: 480 })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          width: 720,
          height: 480,
          style: GROWING_JACKPOT_WIDGET_STYLE_DEFAULTS,
        });
      });

    await agent
      .patch(`/accounts/${accountId}/growing-jackpot-widget`)
      .send({ style: { prizeText: '#123456' } })
      .expect(200)
      .expect(({ body }) => {
        expect(body.style.prizeText).toBe('#123456');
        expect(body.width).toBe(720);
      });
  });

  it('deactivates live session and returns to idle widget', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const create = await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Going off' })
      .expect(201);
    const id = (create.body.session?.id ?? create.body.id) as number;

    await agent
      .post(`/accounts/${accountId}/growing-jackpots/${id}/deactivate`)
      .expect(201);

    await request(app.getHttpServer())
      .get(`/growing-jackpots/widget/${ucid}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('idle');
      });
  });

  it('patches session title via API', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const create = await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Original' })
      .expect(201);
    const id = (create.body.session?.id ?? create.body.id) as number;

    await agent
      .patch(`/accounts/${accountId}/growing-jackpots/${id}`)
      .send({ title: 'Renamed session', settings: { joinKeyword: '!enter' } })
      .expect(200)
      .expect(({ body }) => {
        expect(body.session.title).toBe('Renamed session');
        expect(body.session.settings.joinKeyword).toBe('!enter');
      });
  });

  it('stops round and returns stopped result', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const create = await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Stop me' })
      .expect(201);
    const id = (create.body.session?.id ?? create.body.id) as number;

    const started = await agent
      .post(`/accounts/${accountId}/growing-jackpots/${id}/rounds/start`)
      .expect(201);
    const roundId = started.body.round.id as number;

    await agent
      .post(
        `/accounts/${accountId}/growing-jackpots/${id}/rounds/${roundId}/stop`,
      )
      .expect(201)
      .expect(({ body }) => {
        expect(body.round.result).toBe('stopped');
        expect(body.round.phase).toBe('closed');
      });
  });

  it('archives a closed round from history', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const create = await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Archive round' })
      .expect(201);
    const id = (create.body.session?.id ?? create.body.id) as number;

    const started = await agent
      .post(`/accounts/${accountId}/growing-jackpots/${id}/rounds/start`)
      .expect(201);
    const roundId = started.body.round.id as number;

    await agent
      .post(
        `/accounts/${accountId}/growing-jackpots/${id}/rounds/${roundId}/stop`,
      )
      .expect(201);

    await agent
      .delete(
        `/accounts/${accountId}/growing-jackpots/${id}/rounds/${roundId}`,
      )
      .expect(204);

    await agent
      .get(
        `/accounts/${accountId}/growing-jackpots/${id}/rounds?page=1&limit=10&sortBy=time&sortOrder=desc`,
      )
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toBe(0);
      });
  });

  it('shows no_participants on public widget after empty round ends', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const create = await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Nobody' })
      .expect(201);
    const id = (create.body.session?.id ?? create.body.id) as number;

    const started = await agent
      .post(`/accounts/${accountId}/growing-jackpots/${id}/rounds/start`)
      .expect(201);
    store.expireRound(started.body.round.id as number);

    await request(app.getHttpServer())
      .get(`/growing-jackpots/widget/${ucid}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('no_participants');
      });
  });

  it('returns 404 for unknown widget ucid', async () => {
    await request(app.getHttpServer())
      .get(
        '/growing-jackpots/widget/00000000-0000-0000-0000-000000000099',
      )
      .expect(404);
  });

  it('flushes winner chat announcement on public widget poll', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const create = await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Announce' })
      .expect(201);
    const id = (create.body.session?.id ?? create.body.id) as number;

    const started = await agent
      .post(`/accounts/${accountId}/growing-jackpots/${id}/rounds/start`)
      .expect(201);
    const roundId = started.body.round.id as number;
    store.addParticipant(roundId, 'ann-1', 'streamer_pick');
    store.expireRound(roundId);

    await request(app.getHttpServer())
      .get(`/growing-jackpots/widget/${ucid}`)
      .expect(200);

    expect(winnerChatAnnouncements).toEqual([
      {
        broadcasterUserId: 'channel-mock',
        displayName: 'streamer_pick',
        proofToken: expect.stringMatching(/^WIN-/),
      },
    ]);
  });

  it('lists sessions with pagination metadata', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'One' })
      .expect(201);
    await agent
      .post(`/accounts/${accountId}/growing-jackpots`)
      .send({ title: 'Two' })
      .expect(201);

    await agent
      .get(`/accounts/${accountId}/growing-jackpots?archived=false&page=1&limit=10`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toBeGreaterThanOrEqual(2);
        expect(body.sessions.length).toBeGreaterThanOrEqual(2);
        expect(body.page).toBe(1);
        expect(body.limit).toBe(10);
      });
  });
});

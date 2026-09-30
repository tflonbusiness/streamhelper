import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DatabaseService } from './../src/database/database.service.js';

describe('Kick chat webhook (e2e)', () => {
  let app: INestApplication<App>;
  let previousChatMock: string | undefined;
  const liveSession = {
    id: 1,
    accountId: 10,
    keyword: '!join',
    isAcceptingParticipants: true,
    replyInChat: false,
    roleSettings: {
      moderator: { enabled: false, weight: 1 },
      vip: { enabled: true, weight: 2 },
      og: { enabled: false, weight: 1.5 },
      viewer: { enabled: true, weight: 1 },
      paid_subscriber: { enabled: true, weight: 2 },
    },
  };

  beforeEach(async () => {
    previousChatMock = process.env.KICK_CHAT_MOCK;
    process.env.KICK_CHAT_MOCK = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        recordKickChatEvent: async (input: { messageId: string }) =>
          input.messageId !== 'dup-001',
        getAccountIdByKickChannelId: async (channelId: string) =>
          channelId === 'channel-mock' ? 10 : null,
        getChatRollForIntake: async (accountId: number, keyword: string) =>
          accountId === 10 &&
          keyword.trim().toLowerCase() === liveSession.keyword.trim().toLowerCase()
            ? liveSession
            : null,
        insertChatRollParticipantFromChat: async () => ({
          status: 'created' as const,
          participantId: 42,
        }),
        accountHasSubscriptionAccess: async () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
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
    if (previousChatMock === undefined) {
      delete process.env.KICK_CHAT_MOCK;
    } else {
      process.env.KICK_CHAT_MOCK = previousChatMock;
    }
    await app.close();
  });

  it('adds participant when keyword matches via mock injector', async () => {
    const response = await request(app.getHttpServer())
      .post('/dev/kick/chat')
      .send({
        message_id: 'mock-join-001',
        broadcaster: { user_id: 'channel-mock' },
        sender: {
          user_id: 'viewer-1',
          username: 'luckyviewer',
          identity: { badges: [{ type: 'subscriber' }] },
        },
        content: '!join',
      })
      .expect(200);

    expect(response.body).toEqual({
      ok: true,
      result: {
        winnerResponse: {
          action: 'ignored',
          reason: 'response_disabled',
        },
        intake: {
          action: 'participant_added',
          displayName: 'luckyviewer',
          replyInChat: false,
        },
      },
    });
  });

  it('confirms pending winner response on live session', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        recordKickChatEvent: async () => true,
        getAccountIdByKickChannelId: async (channelId: string) =>
          channelId === 'channel-mock' ? 10 : null,
        getLiveChatRollByAccountId: async (accountId: number) =>
          accountId === 10
            ? {
                id: 1,
                accountId: 10,
                status: 'live',
                winnerResponseEnabled: true,
                winnerResponseSeconds: 60,
              }
            : null,
        expirePendingChatRollWinResponses: async () => undefined,
        confirmChatRollWinResponse: async (input: {
          chatRollId: number;
          providerUserId: string;
        }) =>
          input.chatRollId === 1 && input.providerUserId === 'winner-42'
            ? 99
            : null,
        getChatRollForIntake: async () => null,
        accountHasSubscriptionAccess: async () => true,
      })
      .compile();

    const winnerApp = moduleFixture.createNestApplication({ rawBody: true });
    winnerApp.use(cookieParser());
    winnerApp.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );
    await winnerApp.init();

    const response = await request(winnerApp.getHttpServer())
      .post('/dev/kick/chat')
      .send({
        message_id: 'mock-winner-001',
        broadcaster: { user_id: 'channel-mock' },
        sender: { user_id: 'winner-42', username: 'winner_user' },
        content: 'here',
      })
      .expect(200);

    expect(response.body.result.winnerResponse).toEqual({
      action: 'confirmed',
      winId: 99,
    });

    await winnerApp.close();
  });

  it('ignores chat roll intake when subscription expired', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        getAccountIdByKickChannelId: async (channelId: string) =>
          channelId === 'channel-mock' ? 10 : null,
        accountHasSubscriptionAccess: async () => false,
        getChatRollForIntake: async () => liveSession,
        recordKickChatEvent: async () => true,
      })
      .compile();

    const expiredApp = moduleFixture.createNestApplication({ rawBody: true });
    expiredApp.use(cookieParser());
    expiredApp.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );
    await expiredApp.init();

    const response = await request(expiredApp.getHttpServer())
      .post('/dev/kick/chat')
      .send({
        message_id: 'mock-join-expired',
        broadcaster: { user_id: 'channel-mock' },
        sender: { user_id: 'viewer-9', username: 'blocked' },
        content: '!join',
      })
      .expect(200);

    expect(response.body.result.intake).toEqual({
      action: 'ignored',
      reason: 'subscription_expired',
    });

    await expiredApp.close();
  });

  it('ignores keyword mismatch', async () => {
    const response = await request(app.getHttpServer())
      .post('/dev/kick/chat')
      .send({
        message_id: 'mock-join-002',
        broadcaster: { user_id: 'channel-mock' },
        sender: { user_id: 'viewer-2', username: 'other' },
        content: '!wrong',
      })
      .expect(200);

    expect(response.body.result.intake).toEqual({
      action: 'ignored',
      reason: 'keyword_mismatch',
    });
  });

  it('rejects mock injector when mock mode is disabled', async () => {
    process.env.KICK_CHAT_MOCK = 'false';

    await request(app.getHttpServer())
      .post('/dev/kick/chat')
      .send({
        message_id: 'mock-join-003',
        broadcaster: { user_id: 'channel-mock' },
        sender: { user_id: 'viewer-3', username: 'blocked' },
        content: '!join',
      })
      .expect(401);
  });
});

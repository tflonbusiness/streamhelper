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
        getLiveChatRollForIntake: async (accountId: number) =>
          accountId === 10 ? liveSession : null,
        insertChatRollParticipantFromChat: async () => ({
          status: 'created' as const,
          participantId: 42,
        }),
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

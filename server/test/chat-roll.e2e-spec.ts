import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { CHAT_ROLL_WIDGET_KEYWORD_PREFIX_DEFAULT } from './../src/chat-roll/chat-roll-widget.constants.js';
import { DEFAULT_CHAT_ROLL_ROLE_SETTINGS } from './../src/chat-roll/chat-roll-utils.js';
import { initialSessionStatusOnCreate } from './../src/session-lifecycle/initial-session-status-on-create.js';
import type { DbChatRoll } from './../src/database/database.service.js';
import { DatabaseService } from './../src/database/database.service.js';
import {
  activeTrialSubscriptionFixture,
  subscriptionDatabaseMocks,
} from '../src/subscriptions/account-subscription-fixtures.js';

describe('Chat roll create (e2e)', () => {
  let app: INestApplication<App>;
  let previousMockEnv: string | undefined;
  let chatRolls: DbChatRoll[] = [];
  let nextChatRollId = 1;

  beforeEach(async () => {
    previousMockEnv = process.env.KICK_OAUTH_MOCK;
    process.env.KICK_OAUTH_MOCK = 'true';
    chatRolls = [];
    nextChatRollId = 1;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        hasActiveCredentials: async () => true,
        findUserById: async (userId: number) =>
          userId === 1 ? { id: 1, name: 'demo_streamer' } : null,
        getPrimaryMembership: async (userId: number) =>
          userId === 1
            ? {
                accountId: 10,
                name: 'demo_streamer',
                role: 'owner' as const,
                subscriptionPlan: 'free',
                ucid: '550e8400-e29b-41d4-a716-446655440000',
                subscription: activeTrialSubscriptionFixture(),
              }
            : null,
        hasActiveMembership: async (accountId: number, userId: number) =>
          accountId === 10 && userId === 1,
        createChatRoll: async (
          accountId: number,
          createdByUserId: number,
          title: string,
        ) => {
          const trimmedTitle = title.trim();
          if (trimmedTitle.length === 0 || trimmedTitle.length > 200) {
            throw new Error('INVALID_TITLE');
          }

          const hasLive = chatRolls.some(
            (row) => row.accountId === accountId && row.status === 'live',
          );
          const status = initialSessionStatusOnCreate(hasLive);
          const row: DbChatRoll = {
            id: nextChatRollId++,
            accountId,
            title: trimmedTitle,
            status,
            keyword: '!roll',
            widgetKeywordPrefix: CHAT_ROLL_WIDGET_KEYWORD_PREFIX_DEFAULT,
            combineMode: 'highest',
            excludeWinnerAfterRoll: true,
            isAcceptingParticipants: true,
            replyInChat: false,
            winnerResponseEnabled: true,
            winnerResponseSeconds: 60,
            showWinnerResponseInReveal: true,
            roleSettings: DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
            createdAt: new Date('2026-09-14T12:00:00.000Z'),
            createdByUserId,
            createdByName: 'demo_streamer',
          };
          chatRolls.push(row);
          return row;
        },
        ...subscriptionDatabaseMocks,
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

  it('creates the first session as live', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post('/accounts/10/chat-rolls')
      .send({ title: 'Friday roll' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe('live');
        expect(body.title).toBe('Friday roll');
      });
  });

  it('creates off_air when another session is already live', async () => {
    chatRolls.push({
      id: 1,
      accountId: 10,
      title: 'Live session',
      status: 'live',
      keyword: '!roll',
      widgetKeywordPrefix: CHAT_ROLL_WIDGET_KEYWORD_PREFIX_DEFAULT,
      combineMode: 'highest',
      excludeWinnerAfterRoll: true,
      isAcceptingParticipants: true,
      replyInChat: false,
      winnerResponseEnabled: true,
      winnerResponseSeconds: 60,
      showWinnerResponseInReveal: true,
      roleSettings: DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
      createdAt: new Date('2026-09-14T11:00:00.000Z'),
      createdByUserId: 1,
      createdByName: 'demo_streamer',
    });
    nextChatRollId = 2;

    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post('/accounts/10/chat-rolls')
      .send({ title: 'Second roll' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe('off_air');
        expect(body.title).toBe('Second roll');
      });
  });
});

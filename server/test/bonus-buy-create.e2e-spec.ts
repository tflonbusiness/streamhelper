import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import type { DbBonusBuy } from './../src/database/database.service.js';
import { DatabaseService } from './../src/database/database.service.js';
import { initialSessionStatusOnCreate } from './../src/session-lifecycle/initial-session-status-on-create.js';

describe('Bonus buy create (e2e)', () => {
  let app: INestApplication<App>;
  let previousMockEnv: string | undefined;
  let bonusBuys: DbBonusBuy[] = [];
  let nextBonusBuyId = 1;

  beforeEach(async () => {
    previousMockEnv = process.env.KICK_OAUTH_MOCK;
    process.env.KICK_OAUTH_MOCK = 'true';
    bonusBuys = [];
    nextBonusBuyId = 1;

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
              }
            : null,
        hasActiveMembership: async (accountId: number, userId: number) =>
          accountId === 10 && userId === 1,
        createBonusBuy: async (
          accountId: number,
          createdByUserId: number,
          name: string,
          startBalance: string,
          currencyCode: string,
        ) => {
          const trimmedName = name.trim();
          if (trimmedName.length === 0 || trimmedName.length > 200) {
            throw new Error('INVALID_NAME');
          }

          const hasLive = bonusBuys.some(
            (row) => row.accountId === accountId && row.status === 'live',
          );
          const status = initialSessionStatusOnCreate(hasLive);
          const row: DbBonusBuy = {
            id: nextBonusBuyId++,
            accountId,
            name: trimmedName,
            startBalance,
            currencyCode,
            status,
            createdAt: new Date('2026-09-14T12:00:00.000Z'),
            createdByUserId,
            createdByName: 'demo_streamer',
          };
          bonusBuys.push(row);
          return row;
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

  it('creates the first session as live', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post('/accounts/10/bonus-buys')
      .send({ name: 'Friday stream', start_balance: '50.00' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe('live');
        expect(body.name).toBe('Friday stream');
      });
  });

  it('creates off_air when another session is already live', async () => {
    bonusBuys.push({
      id: 1,
      accountId: 10,
      name: 'Live session',
      startBalance: '10.00',
      currencyCode: 'USD',
      status: 'live',
      createdAt: new Date('2026-09-14T11:00:00.000Z'),
      createdByUserId: 1,
      createdByName: 'demo_streamer',
    });
    nextBonusBuyId = 2;

    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post('/accounts/10/bonus-buys')
      .send({ name: 'Second stream', start_balance: '25.00' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe('off_air');
        expect(body.name).toBe('Second stream');
      });
  });
});

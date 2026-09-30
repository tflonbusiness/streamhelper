import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DatabaseService } from './../src/database/database.service.js';
import {
  activeTrialSubscriptionFixture,
  subscriptionDatabaseMocks,
} from '../src/subscriptions/account-subscription-fixtures.js';

describe('Subscription access (e2e)', () => {
  let app: INestApplication<App>;
  let previousMockEnv: string | undefined;
  let subscriptionActive = true;

  beforeEach(async () => {
    previousMockEnv = process.env.KICK_OAUTH_MOCK;
    process.env.KICK_OAUTH_MOCK = 'true';
    subscriptionActive = true;

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
                ucid: '550e8400-e29b-41d4-a716-446655440000',
                name: 'demo_streamer',
                role: 'owner' as const,
                subscriptionPlan: 'free',
                subscription: activeTrialSubscriptionFixture({
                  hasAccess: subscriptionActive,
                  status: subscriptionActive ? 'active' : 'expired',
                }),
              }
            : null,
        hasActiveMembership: async (accountId: number, userId: number) =>
          accountId === 10 && userId === 1,
        accountHasSubscriptionAccess: async () => subscriptionActive,
        findCredentialByProvider: async (provider: string, providerUserId: string) => {
          if (provider === 'kick' && providerUserId === 'kick-mock-user') {
            return { userId: 1, isActive: true };
          }
          return null;
        },
        provisionOwnerFromKick: async () => ({
          userId: 1,
          membership: {
            accountId: 10,
            ucid: '550e8400-e29b-41d4-a716-446655440000',
            name: 'demo_streamer',
            role: 'owner' as const,
            subscriptionPlan: 'free',
            subscription: activeTrialSubscriptionFixture({
              hasAccess: subscriptionActive,
              status: subscriptionActive ? 'active' : 'expired',
            }),
          },
        }),
        listBonusBuys: async () => [],
        loadAccountSubscriptionSnapshot: async () =>
          activeTrialSubscriptionFixture({
            hasAccess: subscriptionActive,
            status: subscriptionActive ? 'active' : 'expired',
          }),
        getAccountIdByUcid: subscriptionDatabaseMocks.getAccountIdByUcid,
        isPlatformAdmin: subscriptionDatabaseMocks.isPlatformAdmin,
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

  it('allows module API while subscription is active', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent.get('/accounts/10/bonus-buys').expect(200);
  });

  it('blocks module API when subscription expired', async () => {
    subscriptionActive = false;
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/bonus-buys')
      .expect(403)
      .expect(({ body }) => {
        expect(body.message?.code ?? body.code).toBe('SUBSCRIPTION_EXPIRED');
      });
  });

  it('still returns session on /auth/me when subscription expired', async () => {
    subscriptionActive = false;
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/auth/me')
      .expect(200)
      .expect(({ body }) => {
        expect(body.user.subscription?.hasAccess).toBe(false);
      });
  });
});

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

describe('Internal subscriptions admin (e2e)', () => {
  let app: INestApplication<App>;
  let previousMockEnv: string | undefined;
  let platformAdmin = false;
  let lastUpdate: unknown;

  beforeEach(async () => {
    previousMockEnv = process.env.KICK_OAUTH_MOCK;
    process.env.KICK_OAUTH_MOCK = 'true';
    platformAdmin = false;
    lastUpdate = null;

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
                subscription: activeTrialSubscriptionFixture(),
              }
            : null,
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
            subscription: activeTrialSubscriptionFixture(),
          },
        }),
        loadAccountSubscriptionSnapshot: async () =>
          activeTrialSubscriptionFixture(),
        getAccountIdByUcid: subscriptionDatabaseMocks.getAccountIdByUcid,
        isPlatformAdmin: async (userId: number) =>
          platformAdmin && userId === 1,
        searchSubscriptionAdminAccounts: async (params: { query: string }) => {
          const demoItem = {
            accountId: 10,
            ucid: '550e8400-e29b-41d4-a716-446655440000',
            name: 'demo_streamer',
            subscriptionPlan: 'free',
            channelSlug: 'demo',
            subscription: activeTrialSubscriptionFixture(),
          };
          if (params.query === '' || params.query === 'demo') {
            return {
              items: [demoItem],
              total: 1,
              page: 1,
              pageSize: 20,
            };
          }
          return { items: [], total: 0, page: 1, pageSize: 20 };
        },
        getSubscriptionAdminAccountDetail: async (accountId: number) => {
          if (accountId !== 10) {
            return null;
          }
          return {
            accountId: 10,
            ucid: '550e8400-e29b-41d4-a716-446655440000',
            name: 'demo_streamer',
            subscriptionPlan: 'free',
            channelSlug: 'demo',
            subscription: activeTrialSubscriptionFixture(),
            owners: [{ userId: 1, name: 'demo_streamer' }],
          };
        },
        applySubscriptionAdminUpdate: async (
          accountId: number,
          operatorUserId: number,
          input: unknown,
        ) => {
          lastUpdate = { accountId, operatorUserId, input };
          return {
            accountId: 10,
            ucid: '550e8400-e29b-41d4-a716-446655440000',
            name: 'demo_streamer',
            subscriptionPlan: 'pro',
            channelSlug: 'demo',
            subscription: activeTrialSubscriptionFixture({
              kind: 'paid',
              hasAccess: true,
            }),
            owners: [{ userId: 1, name: 'demo_streamer' }],
          };
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

  it('forbids internal API for non-platform admin', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent.get('/internal/subscriptions?q=demo').expect(403);
  });

  it('allows search and update for platform admin', async () => {
    platformAdmin = true;
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const listAll = await agent.get('/internal/subscriptions').expect(200);
    expect(listAll.body.items).toHaveLength(1);
    expect(listAll.body.total).toBe(1);

    const search = await agent.get('/internal/subscriptions?q=demo').expect(200);
    expect(search.body.items).toHaveLength(1);
    expect(search.body.total).toBe(1);
    expect(search.body.page).toBe(1);

    const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await agent
      .put('/internal/subscriptions/10')
      .send({ mode: 'paid', paidPlan: 'pro', endsAt })
      .expect(200);

    expect(lastUpdate).toMatchObject({
      accountId: 10,
      operatorUserId: 1,
      input: { mode: 'paid', paidPlan: 'pro' },
    });
  });

  it('exposes platformAdmin on auth me', async () => {
    platformAdmin = true;
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const me = await agent.get('/auth/me').expect(200);
    expect(me.body.user.platformAdmin).toBe(true);
  });

  it('redirects platform admin OAuth to workspace chooser', async () => {
    platformAdmin = true;
    const agent = request.agent(app.getHttpServer());

    await agent.get('/auth/oauth/kick');
    await agent
      .get('/auth/oauth/kick/callback?code=mock-kick-code')
      .expect(302)
      .expect('Location', 'http://localhost:5173/continue');
  });

  it('redirects non-admin OAuth to dashboard', async () => {
    platformAdmin = false;
    const agent = request.agent(app.getHttpServer());

    await agent.get('/auth/oauth/kick/callback?code=mock-kick-code')
      .expect(302)
      .expect('Location', 'http://localhost:5173/dashboard');
  });
});

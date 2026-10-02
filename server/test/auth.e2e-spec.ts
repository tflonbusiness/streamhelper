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

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let moderatorActive = true;
  let previousMockEnv: string | undefined;

  beforeEach(async () => {
    previousMockEnv = process.env.KICK_OAUTH_MOCK;
    process.env.KICK_OAUTH_MOCK = 'true';
    moderatorActive = true;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        hasActiveCredentials: async (userId: number) => {
          if (userId === 1 || (userId === 3 && moderatorActive)) {
            return true;
          }
          return false;
        },
        findUserById: async (userId: number) => {
          if (userId === 1) {
            return { id: 1, name: 'demo_streamer' };
          }
          if (userId === 3) {
            return { id: 3, name: 'demo_moderator' };
          }
          return null;
        },
        getPrimaryMembership: async (userId: number) => {
          if (userId === 1) {
            return {
              accountId: 10,
              name: 'demo_streamer',
              role: 'owner' as const,
              subscriptionPlan: 'free',
              ucid: '550e8400-e29b-41d4-a716-446655440000',
              subscription: activeTrialSubscriptionFixture(),
            };
          }
          if (userId === 3 && moderatorActive) {
            return {
              accountId: 10,
              name: 'demo_streamer',
              role: 'moderator' as const,
              subscriptionPlan: 'free',
              ucid: '550e8400-e29b-41d4-a716-446655440000',
              subscription: activeTrialSubscriptionFixture(),
            };
          }
          return null;
        },
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
            name: 'new_streamer',
            role: 'owner' as const,
            subscriptionPlan: 'free',
            ucid: '550e8400-e29b-41d4-a716-446655440000',
            subscription: activeTrialSubscriptionFixture(),
          },
        }),
        findAccessLinkUserIdByToken: async (token: string) => {
          if (token === 'valid-moderator-token' && moderatorActive) {
            return 3;
          }
          return null;
        },
        isAccountOwner: async () => true,
        hasActiveMembership: async () => true,
        listAccountMembers: async () => ({
          members: [],
          total: 0,
          page: 1,
          limit: 10,
        }),
        createModeratorWithAccessLink: async () => ({
          userId: 99,
          name: 'New Moderator',
          joinUrl: 'http://localhost:5173/join/test-token',
        }),
        revokeModeratorPermanently: async () => {
          moderatorActive = false;
        },
        isPlatformAdmin: async () => false,
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

  it('redirects kick OAuth authorize', () => {
    return request(app.getHttpServer())
      .get('/auth/oauth/kick')
      .expect(302)
      .expect('Location', /\/auth\/oauth\/kick\/callback\?/);
  });

  it('kick callback creates session and redirects to dashboard', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .get('/auth/oauth/kick/callback?code=mock-kick-code')
      .expect(302)
      .expect('Location', 'http://localhost:5173/dashboard');

    await agent
      .get('/auth/me')
      .expect(200)
      .expect(({ body }) => {
        expect(body.user.id).toBe(1);
        expect(body.user.accountId).toBe(10);
        expect(body.user.role).toBe('owner');
        expect(body.loginSurface).toBe('streamer');
      });
  });

  it('moderator join creates session', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .get('/join/valid-moderator-token')
      .expect(302)
      .expect('Location', 'http://localhost:5173/dashboard');

    await agent
      .get('/auth/me')
      .expect(200)
      .expect(({ body }) => {
        expect(body.user.id).toBe(3);
        expect(body.user.role).toBe('moderator');
      });
  });

  it('revoked moderator cannot access me', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent.get('/join/valid-moderator-token');
    moderatorActive = false;

    await agent.get('/auth/me').expect(401);
  });

  it('invalid join token redirects with error', () => {
    return request(app.getHttpServer())
      .get('/join/bad-token')
      .expect(302)
      .expect('Location', 'http://localhost:5173/login?join_error=1');
  });
});

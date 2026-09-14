import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DatabaseService } from './../src/database/database.service.js';

const MEMBERS = [
  {
    userId: 1,
    name: 'demo_streamer',
    role: 'owner' as const,
    isActive: true,
    hasInviteLink: false,
  },
  {
    userId: 3,
    name: 'demo_admin',
    role: 'admin' as const,
    isActive: true,
    hasInviteLink: true,
  },
];

describe('AccountsController (e2e)', () => {
  let app: INestApplication<App>;
  let members = [...MEMBERS];

  beforeEach(async () => {
    members = [...MEMBERS];

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        hasActiveCredentials: async () => true,
        findUserById: async (userId: number) => {
          const member = members.find((m) => m.userId === userId);
          return member ? { id: userId, name: member.name } : null;
        },
        getPrimaryMembership: async (userId: number) => {
          if (userId === 1) {
            return {
              accountId: 10,
              name: 'demo_streamer',
              role: 'owner' as const,
              subscriptionPlan: 'free',
            };
          }
          if (userId === 3) {
            return {
              accountId: 10,
              name: 'demo_streamer',
              role: 'admin' as const,
              subscriptionPlan: 'free',
            };
          }
          return null;
        },
        hasActiveMembership: async (accountId: number, userId: number) =>
          accountId === 10 && members.some((m) => m.userId === userId && m.isActive),
        isAccountOwner: async (accountId: number, userId: number) =>
          accountId === 10 && userId === 1,
        listAccountMembers: async () => members,
        createAdminWithAccessLink: async () => ({
          userId: 99,
          name: 'New Admin',
          joinUrl: 'http://localhost:5173/join/new-token',
        }),
        rotateAdminInviteLink: async () => ({
          joinUrl: 'http://localhost:5173/join/rotated-token',
        }),
        revokeAdminPermanently: async (
          _accountId: number,
          _ownerUserId: number,
          adminUserId: number,
        ) => {
          members = members.map((m) =>
            m.userId === adminUserId ? { ...m, isActive: false } : m,
          );
        },
        provisionOwnerFromKick: async () => ({
          userId: 1,
          membership: {
            accountId: 10,
            name: 'demo_streamer',
            role: 'owner' as const,
            subscriptionPlan: 'free',
          },
        }),
        findCredentialByProvider: async (provider: string, providerUserId: string) => {
          if (provider === 'kick' && providerUserId === 'kick-mock-user') {
            return { userId: 1, isActive: true };
          }
          return null;
        },
        getPrimaryKickChannel: async (accountId: number) =>
          accountId === 10
            ? { channelId: 'channel-mock', channelSlug: 'kick_user_mock' }
            : null,
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
  });

  async function loginOwner(agent: request.SuperAgentTest) {
    await agent.get('/auth/oauth/kick/callback?code=mock-kick-code');
  }

  it('returns kick channel for owner', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/kick/channel')
      .expect(200)
      .expect(({ body }) => {
        expect(body.slug).toBe('kick_user_mock');
        expect(body.streamTitle).toBe('CasinoStream demo stream');
        expect(body.isLive).toBe(false);
        expect(body.activeSubscribersCount).toBe(0);
      });
  });

  it('lists members for owner', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/members')
      .expect(200)
      .expect(({ body }) => {
        expect(body.members).toHaveLength(2);
        expect(body.members[0].name).toBe('demo_streamer');
      });
  });

  it('owner creates admin with join link', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post('/accounts/10/admins')
      .send({ name: 'Moderator' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.joinUrl).toContain('/join/');
        expect(body.name).toBe('New Admin');
      });
  });

  it('owner fetches admin invite link', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/members/3/invite-link')
      .expect(200)
      .expect(({ body }) => {
        expect(body.joinUrl).toContain('/join/');
      });
  });

  it('owner permanently revokes admin', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent.delete('/accounts/10/members/3').expect(200);

    await agent
      .get('/accounts/10/members')
      .expect(200)
      .expect(({ body }) => {
        const admin = body.members.find((m: { userId: number }) => m.userId === 3);
        expect(admin?.isActive).toBe(false);
      });
  });
});

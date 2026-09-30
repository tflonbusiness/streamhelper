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
    name: 'demo_moderator',
    role: 'moderator' as const,
    isActive: true,
    hasInviteLink: true,
  },
];

type MockSlot = {
  id: number;
  bonusBuyId: number;
  createdByUserId: number;
  createdByName: string;
  slotName: string;
  providerName: string | null;
  purchaseAmount: string;
  winAmount: string | null;
  multiplier: string | null;
  status: 'pending' | 'playing' | 'archived';
  createdAt: Date;
};

describe('AccountsController (e2e)', () => {
  let app: INestApplication<App>;
  let previousMockEnv: string | undefined;
  let members = [...MEMBERS];
  let slots: MockSlot[] = [];
  let nextSlotId = 1;
  let bonusBuyName = 'Friday stream';
  let bonusBuyStartBalance = '50.00';
  let widgetSettings = {
    id: 1,
    accountId: 10,
    width: 500,
    height: 600,
    backgroundColor: '#0A0A0C',
    surfaceColor: '#121215',
    borderColor: '#2F2F31',
    accentColor: '#F59E0B',
    positiveColor: '#10B981',
    negativeColor: '#EF4444',
    liveColor: '#FF2222',
    textMutedColor: '#9CA3AF',
    borderRadius: 20,
    padding: 18,
    fontFamily: 'Inter, system-ui, sans-serif',
    createdAt: new Date('2026-09-14T12:00:00.000Z'),
    updatedAt: new Date('2026-09-14T12:00:00.000Z'),
  };

  beforeEach(async () => {
    previousMockEnv = process.env.KICK_OAUTH_MOCK;
    process.env.KICK_OAUTH_MOCK = 'true';
    members = [...MEMBERS];
    slots = [];
    nextSlotId = 1;
    bonusBuyName = 'Friday stream';
    bonusBuyStartBalance = '50.00';
    widgetSettings = {
      id: 1,
      accountId: 10,
      width: 500,
      height: 600,
      backgroundColor: '#0A0A0C',
      surfaceColor: '#121215',
      borderColor: '#2F2F31',
      accentColor: '#F59E0B',
      positiveColor: '#10B981',
      negativeColor: '#EF4444',
      liveColor: '#FF2222',
      textMutedColor: '#9CA3AF',
      borderRadius: 20,
      padding: 18,
      fontFamily: 'Inter, system-ui, sans-serif',
      createdAt: new Date('2026-09-14T12:00:00.000Z'),
      updatedAt: new Date('2026-09-14T12:00:00.000Z'),
    };

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
              ucid: '550e8400-e29b-41d4-a716-446655440000',
              subscription: activeTrialSubscriptionFixture(),
            };
          }
          if (userId === 3) {
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
        hasActiveMembership: async (accountId: number, userId: number) =>
          accountId === 10 && members.some((m) => m.userId === userId && m.isActive),
        isAccountOwner: async (accountId: number, userId: number) =>
          accountId === 10 && userId === 1,
        listAccountMembers: async () => members,
        createModeratorWithAccessLink: async () => ({
          userId: 99,
          name: 'New Moderator',
          joinUrl: 'http://localhost:5173/join/new-token',
        }),
        rotateModeratorInviteLink: async () => ({
          joinUrl: 'http://localhost:5173/join/rotated-token',
        }),
        revokeModeratorPermanently: async (
          _accountId: number,
          ownerUserId: number,
          moderatorUserId: number,
        ) => {
          if (ownerUserId !== 1) {
            throw new Error('FORBIDDEN');
          }
          members = members.map((m) =>
            m.userId === moderatorUserId ? { ...m, isActive: false } : m,
          );
        },
        findAccessLinkUserIdByToken: async (token: string) =>
          token === 'valid-moderator-token' ? 3 : null,
        provisionOwnerFromKick: async () => ({
          userId: 1,
          membership: {
            accountId: 10,
            name: 'demo_streamer',
            role: 'owner' as const,
            subscriptionPlan: 'free',
            ucid: '550e8400-e29b-41d4-a716-446655440000',
            subscription: activeTrialSubscriptionFixture(),
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
        listBonusBuys: async () => [],
        getBonusBuyById: async (
          accountId: number,
          bonusBuyId: number,
        ) => ({
          id: bonusBuyId,
          accountId,
          title: bonusBuyName,
          startBalance: bonusBuyStartBalance,
          isActive: true,
          createdAt: new Date('2026-09-14T12:00:00.000Z'),
          createdByUserId: 1,
          createdByName: 'demo_streamer',
        }),
        updateBonusBuy: async (
          accountId: number,
          bonusBuyId: number,
          updates: { title?: string; startBalance?: string },
        ) => {
          if (updates.title !== undefined) {
            bonusBuyName = updates.title;
          }
          if (updates.startBalance !== undefined) {
            bonusBuyStartBalance = updates.startBalance;
          }
          return {
            id: bonusBuyId,
            accountId,
            title: bonusBuyName,
            startBalance: bonusBuyStartBalance,
            isActive: true,
            createdAt: new Date('2026-09-14T12:00:00.000Z'),
            createdByUserId: 1,
            createdByName: 'demo_streamer',
          };
        },
        listBonusBuySlots: async (accountId: number, bonusBuyId: number) =>
          slots
            .filter(
              (slot) =>
                slot.bonusBuyId === bonusBuyId && !slot.isArchived,
            )
            .map((slot) => ({
              ...slot,
              accountId,
            })),
        createBonusBuySlot: async (
          _accountId: number,
          bonusBuyId: number,
          createdByUserId: number,
          slotName: string,
          nickProvider: string | null,
          purchaseAmount: string,
        ) => {
          const slot: MockSlot = {
            id: nextSlotId++,
            bonusBuyId,
            createdByUserId,
            createdByName: 'demo_streamer',
            slotName,
            nickProvider,
            purchaseAmount,
            winAmount: null,
            multiplier: null,
            isNowPlaying: false,
            isArchived: false,
            createdAt: new Date('2026-09-14T12:05:00.000Z'),
          };
          slots.push(slot);
          return slot;
        },
        patchBonusBuySlot: async (
          _accountId: number,
          bonusBuyId: number,
          slotId: number,
          input: {
            slotName?: string;
            nickProvider?: string | null;
            purchaseAmount?: string;
            winAmount?: string | null;
            isNowPlaying?: boolean;
          },
        ) => {
          const slot = slots.find(
            (s) =>
              s.id === slotId &&
              s.bonusBuyId === bonusBuyId &&
              !s.isArchived,
          );
          if (!slot) {
            throw new Error('NOT_FOUND');
          }
          if (input.slotName !== undefined) {
            slot.slotName = input.slotName;
          }
          if (input.nickProvider !== undefined) {
            slot.nickProvider = input.nickProvider;
          }
          if (input.purchaseAmount !== undefined) {
            slot.purchaseAmount = input.purchaseAmount;
          }
          if (input.winAmount !== undefined) {
            slot.winAmount = input.winAmount;
          }
          if (input.isNowPlaying !== undefined) {
            if (input.isNowPlaying) {
              slots.forEach((s) => {
                if (s.bonusBuyId === bonusBuyId) {
                  s.isNowPlaying = s.id === slotId;
                }
              });
            } else {
              slot.isNowPlaying = false;
            }
          }
          if (slot.winAmount !== null) {
            const purchase = Number(slot.purchaseAmount);
            const win = Number(slot.winAmount);
            slot.multiplier = purchase > 0
              ? (Math.round((win / purchase) * 100) / 100).toFixed(2)
              : null;
          } else {
            slot.multiplier = null;
          }
          return slot;
        },
        archiveBonusBuySlot: async (
          _accountId: number,
          bonusBuyId: number,
          slotId: number,
        ) => {
          const slot = slots.find(
            (s) =>
              s.id === slotId &&
              s.bonusBuyId === bonusBuyId &&
              !s.isArchived,
          );
          if (!slot) {
            throw new Error('NOT_FOUND');
          }
          slot.isArchived = true;
          slot.isNowPlaying = false;
        },
        createBonusBuy: async (
          accountId: number,
          createdByUserId: number,
          title: string,
          startBalance: string,
        ) => ({
          id: 1,
          accountId,
          title,
          startBalance,
          isActive: true,
          createdAt: new Date('2026-09-14T12:00:00.000Z'),
          createdByUserId,
          createdByName: 'demo_streamer',
        }),
        getBonusBuyWidget: async (accountId: number) => {
          if (accountId !== 10) {
            throw new Error('NOT_FOUND');
          }
          return widgetSettings;
        },
        patchBonusBuyWidget: async (
          accountId: number,
          input: {
            width?: number;
            height?: number;
            backgroundColor?: string;
            surfaceColor?: string;
            borderColor?: string;
            accentColor?: string;
            positiveColor?: string;
            negativeColor?: string;
            liveColor?: string;
            textMutedColor?: string;
            borderRadius?: number;
            padding?: number;
            fontFamily?: string;
          },
        ) => {
          if (accountId !== 10) {
            throw new Error('NOT_FOUND');
          }
          widgetSettings = {
            ...widgetSettings,
            ...input,
            accountId: 10,
            updatedAt: new Date('2026-09-14T13:00:00.000Z'),
          };
          return widgetSettings;
        },
        endBonusBuy: async (accountId: number, bonusBuyId: number) => ({
          id: bonusBuyId,
          accountId,
          title: 'Friday stream',
          startBalance: '50.00',
          isActive: false,
          createdAt: new Date('2026-09-14T12:00:00.000Z'),
          createdByUserId: 1,
          createdByName: 'demo_streamer',
        }),
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

  async function loginModerator(agent: request.SuperAgentTest) {
    await agent.get('/join/valid-moderator-token');
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

  it('owner creates moderator with join link', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post('/accounts/10/moderators')
      .send({ name: 'Moderator' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.joinUrl).toContain('/join/');
        expect(body.name).toBe('New Moderator');
      });
  });

  it('owner fetches moderator invite link', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/members/3/invite-link')
      .expect(200)
      .expect(({ body }) => {
        expect(body.joinUrl).toContain('/join/');
      });
  });

  it('lists bonus buys for owner', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/bonus-buys')
      .expect(200)
      .expect(({ body }) => {
        expect(body.records).toEqual([]);
      });
  });

  it('owner fetches bonus buy by id', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/bonus-buys/1')
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(1);
        expect(body.title).toBe('Friday stream');
        expect(body.startBalance).toBe('50.00');
      });
  });

  it('owner creates bonus buy', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post('/accounts/10/bonus-buys')
      .send({ title: 'Friday stream', start_balance: '50.00' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.title).toBe('Friday stream');
        expect(body.startBalance).toBe('50.00');
        expect(body.isActive).toBe(true);
        expect(body.createdByUserId).toBe(1);
        expect(body.createdByName).toBe('demo_streamer');
      });
  });

  it('owner ends bonus buy session', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .post('/accounts/10/bonus-buys/1/end')
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBe(1);
        expect(body.isActive).toBe(false);
      });
  });

  it('owner patches bonus buy title and start balance', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .patch('/accounts/10/bonus-buys/1')
      .send({ title: 'Saturday stream', start_balance: '100.00' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe('Saturday stream');
        expect(body.startBalance).toBe('100.00');
      });
  });

  it('owner lists bonus buy slots', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/bonus-buys/1/slots')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([]);
      });
  });

  it('owner creates and patches bonus buy slot', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const created = await agent
      .post('/accounts/10/bonus-buys/1/slots')
      .send({
        slot_name: 'Gates of Olympus',
        nick_provider: 'Pragmatic',
        purchase_amount: '20.00',
      })
      .expect(201);

    expect(created.body.slotName).toBe('Gates of Olympus');
    expect(created.body.purchaseAmount).toBe('20.00');
    expect(created.body.multiplier).toBeNull();

    await agent
      .patch(`/accounts/10/bonus-buys/1/slots/${created.body.id}`)
      .send({ win_amount: '60.00' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.winAmount).toBe('60.00');
        expect(body.multiplier).toBe('3.00');
      });

    await agent
      .patch(`/accounts/10/bonus-buys/1/slots/${created.body.id}`)
      .send({ win_amount: '-1.00' })
      .expect(400);
  });

  it('owner sets and clears now playing slot', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const first = await agent
      .post('/accounts/10/bonus-buys/1/slots')
      .send({ slot_name: 'Slot A', purchase_amount: '10.00' })
      .expect(201);

    const second = await agent
      .post('/accounts/10/bonus-buys/1/slots')
      .send({ slot_name: 'Slot B', purchase_amount: '15.00' })
      .expect(201);

    await agent
      .patch(`/accounts/10/bonus-buys/1/slots/${first.body.id}`)
      .send({ is_now_playing: true })
      .expect(200)
      .expect(({ body }) => {
        expect(body.isNowPlaying).toBe(true);
      });

    await agent
      .patch(`/accounts/10/bonus-buys/1/slots/${second.body.id}`)
      .send({ is_now_playing: true })
      .expect(200)
      .expect(({ body }) => {
        expect(body.isNowPlaying).toBe(true);
      });

    const list = await agent.get('/accounts/10/bonus-buys/1/slots').expect(200);
    const playing = list.body.filter((slot: { isNowPlaying: boolean }) => slot.isNowPlaying);
    expect(playing).toHaveLength(1);
    expect(playing[0].id).toBe(second.body.id);

    await agent
      .patch(`/accounts/10/bonus-buys/1/slots/${second.body.id}`)
      .send({ is_now_playing: false })
      .expect(200)
      .expect(({ body }) => {
        expect(body.isNowPlaying).toBe(false);
      });
  });

  it('owner archives bonus buy slot', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    const created = await agent
      .post('/accounts/10/bonus-buys/1/slots')
      .send({ slot_name: 'To delete', purchase_amount: '5.00' })
      .expect(201);

    await agent
      .delete(`/accounts/10/bonus-buys/1/slots/${created.body.id}`)
      .expect(204);

    await agent
      .get('/accounts/10/bonus-buys/1/slots')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([]);
      });
  });

  it('owner fetches and patches bonus buy widget settings', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent
      .get('/accounts/10/bonus-buy-widget')
      .expect(200)
      .expect(({ body }) => {
        expect(body.width).toBe(500);
        expect(body.backgroundColor).toBe('#0A0A0C');
        expect(body.accountId).toBe(10);
      });

    await agent
      .patch('/accounts/10/bonus-buy-widget')
      .send({ width: 600, accent_color: '#FFFFFF' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.width).toBe(600);
        expect(body.accentColor).toBe('#FFFFFF');
      });
  });

  it('moderator cannot revoke another moderator', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginModerator(agent);

    await agent.delete('/accounts/10/members/3').expect(403);
  });

  it('owner permanently revokes moderator', async () => {
    const agent = request.agent(app.getHttpServer());
    await loginOwner(agent);

    await agent.delete('/accounts/10/members/3').expect(200);

    await agent
      .get('/accounts/10/members')
      .expect(200)
      .expect(({ body }) => {
        const moderator = body.members.find((m: { userId: number }) => m.userId === 3);
        expect(moderator?.isActive).toBe(false);
      });
  });
});

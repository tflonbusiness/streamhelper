import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DatabaseService } from './../src/database/database.service.js';

const ACCOUNT_UCID = '550e8400-e29b-41d4-a716-446655440000';

const DEFAULT_STYLE = {
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
};

const DEFAULT_WIDGET = {
  id: 1,
  accountId: 10,
  presetId: 1,
  width: 500,
  height: 600,
  styleSettings: DEFAULT_STYLE,
  ...DEFAULT_STYLE,
  createdAt: new Date('2026-09-14T12:00:00.000Z'),
  updatedAt: new Date('2026-09-14T12:00:00.000Z'),
};

describe('BonusBuyController (e2e)', () => {
  let app: INestApplication<App>;
  let previousMockEnv: string | undefined;

  beforeEach(async () => {
    previousMockEnv = process.env.KICK_OAUTH_MOCK;
    process.env.KICK_OAUTH_MOCK = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        getPublicBonusBuyWidgetViewByUcid: async (ucid: string) => {
          if (ucid !== ACCOUNT_UCID) {
            return { kind: 'not_found' };
          }

          return {
            kind: 'active',
            record: {
              id: 1,
              name: 'Friday stream',
              startBalance: '50.00',
              currencyCode: 'USD',
              status: 'live' as const,
            },
            slots: [],
            settings: DEFAULT_WIDGET,
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

  it('returns public widget view without auth', async () => {
    await request(app.getHttpServer())
      .get(`/bonus-buys/widget/${ACCOUNT_UCID}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('active');
        expect(body.record.id).toBe(1);
        expect(body.record.name).toBe('Friday stream');
        expect(body.settings.width).toBe(500);
        expect(body.slots).toEqual([]);
      });
  });

  it('returns 404 for unknown account ucid', async () => {
    await request(app.getHttpServer())
      .get('/bonus-buys/widget/00000000-0000-0000-0000-000000000099')
      .expect(404);
  });

  it('returns unavailable when no live session', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        getPublicBonusBuyWidgetViewByUcid: async () => ({
          kind: 'unavailable',
          reason: 'no_live_session',
        }),
      })
      .compile();

    const inactiveApp = moduleFixture.createNestApplication();
    inactiveApp.use(cookieParser());
    inactiveApp.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );
    await inactiveApp.init();

    await request(inactiveApp.getHttpServer())
      .get(`/bonus-buys/widget/${ACCOUNT_UCID}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('unavailable');
        expect(body.reason).toBe('no_live_session');
      });

    await inactiveApp.close();
  });

  afterEach(async () => {
    await app.close();
    if (previousMockEnv === undefined) {
      delete process.env.KICK_OAUTH_MOCK;
    } else {
      process.env.KICK_OAUTH_MOCK = previousMockEnv;
    }
  });
});

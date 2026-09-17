import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DatabaseService } from './../src/database/database.service.js';

const DEFAULT_WIDGET = {
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
        getPublicBonusBuyWidgetView: async (bonusBuyId: number) => {
          if (bonusBuyId !== 1) {
            return null;
          }

          return {
            record: {
              id: 1,
              title: 'Friday stream',
              startBalance: '50.00',
              isActive: true,
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
      .get('/bonus-buys/1/widget')
      .expect(200)
      .expect(({ body }) => {
        expect(body.record.id).toBe(1);
        expect(body.record.title).toBe('Friday stream');
        expect(body.settings.width).toBe(500);
        expect(body.slots).toEqual([]);
      });
  });

  it('returns 404 for unknown bonus buy', async () => {
    await request(app.getHttpServer()).get('/bonus-buys/999/widget').expect(404);
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

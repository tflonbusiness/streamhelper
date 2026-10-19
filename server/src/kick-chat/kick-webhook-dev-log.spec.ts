import {
  isKickWebhookDevLogEnabled,
  logKickDev,
} from './kick-webhook-dev-log.js';

describe('kick-webhook-dev-log', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDebug = process.env.KICK_WEBHOOK_DEBUG;

  afterEach(() => {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
    if (previousDebug === undefined) {
      delete process.env.KICK_WEBHOOK_DEBUG;
    } else {
      process.env.KICK_WEBHOOK_DEBUG = previousDebug;
    }
  });

  it('is enabled outside production when KICK_WEBHOOK_DEBUG is not false', () => {
    delete process.env.NODE_ENV;
    delete process.env.KICK_WEBHOOK_DEBUG;
    expect(isKickWebhookDevLogEnabled()).toBe(true);

    process.env.NODE_ENV = 'development';
    expect(isKickWebhookDevLogEnabled()).toBe(true);
  });

  it('is disabled in production', () => {
    process.env.NODE_ENV = 'production';
    expect(isKickWebhookDevLogEnabled()).toBe(false);
  });

  it('is disabled when KICK_WEBHOOK_DEBUG=false', () => {
    process.env.NODE_ENV = 'development';
    process.env.KICK_WEBHOOK_DEBUG = 'false';
    expect(isKickWebhookDevLogEnabled()).toBe(false);
  });

  it('logKickDev is a no-op when disabled', () => {
    process.env.NODE_ENV = 'production';
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logKickDev('should not print');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

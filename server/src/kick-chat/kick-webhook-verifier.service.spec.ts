import { KickWebhookVerifierService } from './kick-webhook-verifier.service.js';

describe('KickWebhookVerifierService', () => {
  let previousSkip: string | undefined;

  beforeEach(() => {
    previousSkip = process.env.KICK_WEBHOOK_SKIP_VERIFY;
    delete process.env.KICK_WEBHOOK_SKIP_VERIFY;
  });

  afterEach(() => {
    if (previousSkip === undefined) {
      delete process.env.KICK_WEBHOOK_SKIP_VERIFY;
    } else {
      process.env.KICK_WEBHOOK_SKIP_VERIFY = previousSkip;
    }
  });

  it('rejects invalid signature when verification is enabled', async () => {
    const service = new KickWebhookVerifierService();
    await expect(
      service.verifySignature({
        messageId: 'msg-1',
        timestamp: '123',
        signature: Buffer.from('not-a-valid-sig').toString('base64'),
        rawBody: Buffer.from('{}'),
      }),
    ).rejects.toThrow('Invalid Kick webhook signature');
  });

  it('skips verification when KICK_WEBHOOK_SKIP_VERIFY=true', async () => {
    process.env.KICK_WEBHOOK_SKIP_VERIFY = 'true';
    const service = new KickWebhookVerifierService();
    await expect(
      service.verifySignature({
        messageId: 'msg-1',
        timestamp: '123',
        signature: 'invalid',
        rawBody: Buffer.from('{}'),
      }),
    ).resolves.toBeUndefined();
  });
});

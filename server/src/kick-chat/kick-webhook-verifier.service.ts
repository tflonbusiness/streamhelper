import { createPublicKey, type KeyObject, verify } from 'node:crypto';
import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';

const KICK_PUBLIC_KEY_URL = 'https://api.kick.com/public/v1/public-key';

/** Fallback if api.kick.com is unreachable at startup (keep in sync with public-key endpoint). */
const KICK_PUBLIC_KEY_FALLBACK_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0C0tthITvk/EjIxCGCko
YrxM7eqP4GDnUyP4BnfgJ9yaHqniNfraxTKeRv7TGkOOZviow2zcx/YP9waURfHd
cZOHU+EKA3lSFdMpezLiDGaym+FxR0iXAFZXE9VBdCCOyBeK81/m3mGScGVBNumt
6pGCZYU9DCn5oqnC6RC5pUnlHnJp+TOXW6z8Silr4Y81a/66b0FAJ6EGUVXmXXgP
FXQRTmJcLM4EgCXfNXLwExzr2MtowBwp5PYD6Usl7uZcnMIPutPdXJ0JnvqrztFC
QTvrGMxzKLKLcKQTG159jfHGJ4wKSeenvwXN8jaVJAtW7wRAooRRT8Kho7Axe8jp
qQIDAQAB
-----END PUBLIC KEY-----`;

@Injectable()
export class KickWebhookVerifierService implements OnModuleInit {
  private readonly logger = new Logger(KickWebhookVerifierService.name);
  private publicKey: KeyObject = createPublicKey(KICK_PUBLIC_KEY_FALLBACK_PEM);

  async onModuleInit(): Promise<void> {
    if (this.isSkipVerify()) {
      this.logger.warn(
        'KICK_WEBHOOK_SKIP_VERIFY=true — Kick webhook signature checks are disabled (testing only)',
      );
    }
    await this.loadPublicKey();
  }

  isMockMode(): boolean {
    return process.env.KICK_CHAT_MOCK === 'true';
  }

  /** Bypass RSA signature verification (e.g. broken proxy relay). Not for production. */
  isSkipVerify(): boolean {
    const value = process.env.KICK_WEBHOOK_SKIP_VERIFY?.trim().toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  }

  bypassesSignatureVerification(): boolean {
    return this.isMockMode() || this.isSkipVerify();
  }

  private async loadPublicKey(): Promise<void> {
    const fromEnv = process.env.KICK_WEBHOOK_PUBLIC_KEY_PEM?.trim();
    if (fromEnv) {
      this.publicKey = createPublicKey(fromEnv);
      this.logger.log('Using Kick webhook public key from KICK_WEBHOOK_PUBLIC_KEY_PEM');
      return;
    }

    try {
      const response = await fetch(KICK_PUBLIC_KEY_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as {
        data?: { public_key?: string };
      };
      const pem = payload.data?.public_key?.trim();
      if (!pem) {
        throw new Error('missing data.public_key');
      }
      this.publicKey = createPublicKey(pem);
      this.logger.log('Loaded Kick webhook public key from api.kick.com');
    } catch (error) {
      this.logger.warn(
        `Could not fetch Kick webhook public key; using built-in fallback (${error instanceof Error ? error.message : String(error)})`,
      );
      this.publicKey = createPublicKey(KICK_PUBLIC_KEY_FALLBACK_PEM);
    }
  }

  verifySignature(input: {
    messageId: string;
    timestamp: string;
    signature: string;
    rawBody: Buffer;
  }): void {
    if (this.bypassesSignatureVerification()) {
      return;
    }

    const signatureInput = Buffer.from(
      `${input.messageId}.${input.timestamp}.${input.rawBody.toString('utf8')}`,
      'utf8',
    );
    const signature = Buffer.from(input.signature, 'base64');

    const valid = verify(
      'RSA-SHA256',
      signatureInput,
      this.publicKey,
      signature,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid Kick webhook signature');
    }
  }
}

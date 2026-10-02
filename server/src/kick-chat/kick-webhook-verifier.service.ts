import { createHash } from 'node:crypto';
import { createPublicKey, type KeyObject, verify } from 'node:crypto';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';

const KICK_PUBLIC_KEY_URL = 'https://api.kick.com/public/v1/public-key';
const DEFAULT_PUBLIC_KEY_REFRESH_MS = 3 * 60 * 60 * 1000;

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
export class KickWebhookVerifierService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KickWebhookVerifierService.name);
  private publicKey: KeyObject = createPublicKey(KICK_PUBLIC_KEY_FALLBACK_PEM);
  private keySource: 'env' | 'api' | 'fallback' = 'fallback';
  private keyFingerprint = '';
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  async onModuleInit(): Promise<void> {
    if (this.isSkipVerify()) {
      this.logger.warn(
        'KICK_WEBHOOK_SKIP_VERIFY=true — Kick webhook signature checks are disabled (testing only)',
      );
    }
    await this.loadPublicKey({ reason: 'startup' });
    this.schedulePublicKeyRefresh();
  }

  onModuleDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
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

  private usesPinnedPublicKey(): boolean {
    return Boolean(process.env.KICK_WEBHOOK_PUBLIC_KEY_PEM?.trim());
  }

  private fingerprintPem(pem: string): string {
    return createHash('sha256').update(pem).digest('hex').slice(0, 12);
  }

  private setPublicKey(pem: string, source: 'env' | 'api' | 'fallback'): void {
    const nextFingerprint = this.fingerprintPem(pem);
    const rotated = this.keyFingerprint !== '' && nextFingerprint !== this.keyFingerprint;
    this.publicKey = createPublicKey(pem);
    this.keySource = source;
    this.keyFingerprint = nextFingerprint;
    if (rotated) {
      this.logger.warn(
        `Kick webhook public key rotated (source=${source}, fp=${nextFingerprint})`,
      );
    }
  }

  private schedulePublicKeyRefresh(): void {
    if (this.usesPinnedPublicKey()) {
      return;
    }
    const raw = process.env.KICK_WEBHOOK_PUBLIC_KEY_REFRESH_MS?.trim();
    const ms = raw ? Number.parseInt(raw, 10) : DEFAULT_PUBLIC_KEY_REFRESH_MS;
    if (!Number.isFinite(ms) || ms <= 0) {
      return;
    }
    this.refreshTimer = setInterval(() => {
      void this.loadPublicKey({ reason: 'scheduled' });
    }, ms);
  }

  private async loadPublicKey(input: { reason: string }): Promise<boolean> {
    const fromEnv = process.env.KICK_WEBHOOK_PUBLIC_KEY_PEM?.trim();
    if (fromEnv) {
      this.setPublicKey(fromEnv, 'env');
      if (input.reason === 'startup') {
        this.logger.log('Using Kick webhook public key from KICK_WEBHOOK_PUBLIC_KEY_PEM');
      }
      return true;
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
      const previous = this.keyFingerprint;
      this.setPublicKey(pem, 'api');
      if (input.reason === 'startup') {
        this.logger.log('Loaded Kick webhook public key from api.kick.com');
      } else if (previous !== '' && previous !== this.keyFingerprint) {
        this.logger.log(
          `Refreshed Kick webhook public key (${input.reason}, fp=${this.keyFingerprint})`,
        );
      }
      return true;
    } catch (error) {
      if (input.reason === 'startup' || this.keyFingerprint === '') {
        this.logger.warn(
          `Could not fetch Kick webhook public key; using built-in fallback (${error instanceof Error ? error.message : String(error)})`,
        );
        this.setPublicKey(KICK_PUBLIC_KEY_FALLBACK_PEM, 'fallback');
      } else {
        this.logger.warn(
          `Kick public key refresh failed (${input.reason}); keeping current key (${error instanceof Error ? error.message : String(error)})`,
        );
      }
      return false;
    }
  }

  private verifyWithCurrentKey(signatureInput: Buffer, signature: Buffer): boolean {
    return verify('RSA-SHA256', signatureInput, this.publicKey, signature);
  }

  async verifySignature(input: {
    messageId: string;
    timestamp: string;
    signature: string;
    rawBody: Buffer;
  }): Promise<void> {
    if (this.bypassesSignatureVerification()) {
      return;
    }

    const signatureInput = Buffer.from(
      `${input.messageId}.${input.timestamp}.${input.rawBody.toString('utf8')}`,
      'utf8',
    );
    const signature = Buffer.from(input.signature, 'base64');

    if (this.verifyWithCurrentKey(signatureInput, signature)) {
      return;
    }

    if (!this.usesPinnedPublicKey()) {
      await this.loadPublicKey({ reason: 'signature-mismatch' });
      if (this.verifyWithCurrentKey(signatureInput, signature)) {
        this.logger.log(
          `Kick webhook signature verified after public key refresh (messageId=${input.messageId})`,
        );
        return;
      }
    }

    throw new UnauthorizedException('Invalid Kick webhook signature');
  }
}

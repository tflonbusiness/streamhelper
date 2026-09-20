import { createPublicKey, verify } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';

const KICK_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq/+l1WnlRrGSolDMA+A8
6rAhMbQGmQ2SapVcGM3zq8ANXjnhDWocMqfWcTd95btDydITa10kDvHzw9WQOqp2
MZI7ZyrfzJuz5nhTPCiJwTwnEtWft7nV14BYRDHvlfqPUaZ+1KR4OCaO/wWIk/rQ
L/TjY0M70gse8rlBkbo2a8rKhu69RQTRsoaf4DVhDPEeSeI5jVrRDGAMGL3cGuyY
6CLKGdjVEM78g3JfYOvDU/RvfqD7L89TZ3iN94jrmWdGz34JNlEI5hqK8dd7C5EF
BEbZ5jgB8s8ReQV8H+MkuffjdAj3ajDDX3DOJMIut1lBrUVD1AaSrGCKHooWoL2e
twIDAQAB
-----END PUBLIC KEY-----`;

@Injectable()
export class KickWebhookVerifierService {
  private readonly publicKey = createPublicKey(KICK_PUBLIC_KEY_PEM);

  isMockMode(): boolean {
    return process.env.KICK_CHAT_MOCK === 'true';
  }

  verifySignature(input: {
    messageId: string;
    timestamp: string;
    signature: string;
    rawBody: Buffer;
  }): void {
    if (this.isMockMode()) {
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

import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';

export function generateAccessToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function hashAccessToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function verifyAccessToken(
  token: string,
  tokenHash: string,
): Promise<boolean> {
  return bcrypt.compare(token, tokenHash);
}

export function providerUserIdForAccessLink(): string {
  return randomBytes(16).toString('hex');
}

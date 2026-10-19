import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

export function isKickWebhookDevLogEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.KICK_WEBHOOK_DEBUG !== 'false'
  );
}

export function logKickDev(
  message: string,
  detail?: Record<string, unknown>,
): void {
  if (!isKickWebhookDevLogEnabled()) {
    return;
  }
  if (detail === undefined) {
    console.log(`[kick:dev] ${message}`);
    return;
  }
  console.log(`[kick:dev] ${message} ${JSON.stringify(detail)}`);
}

export function logKickDevPayload(label: string, payload: unknown): void {
  if (!isKickWebhookDevLogEnabled()) {
    return;
  }
  console.log(`[kick:dev] ${label}\n${JSON.stringify(payload, null, 2)}`);
}

function collectKickHeaders(
  headers: Request['headers'],
): Record<string, string | string[] | undefined> {
  const kickHeaders: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key.startsWith('kick-')) {
      kickHeaders[key] = value;
    }
  }
  return kickHeaders;
}

/** Log every POST /webhooks/kick before header/signature/body validation. */
export function logKickDevWebhookRequest(
  req: RawBodyRequest<Request>,
  parsedBody: unknown,
): void {
  if (!isKickWebhookDevLogEnabled()) {
    return;
  }

  const rawBody = req.rawBody;
  let rawBodyText: string | undefined;
  if (rawBody) {
    rawBodyText = rawBody.toString('utf8');
  }

  logKickDevPayload('webhook request (before filters)', {
    meta: {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      ip: req.ip,
    },
    kickHeaders: collectKickHeaders(req.headers),
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    rawBodyBytes: rawBody?.length ?? 0,
    rawBody: rawBodyText,
    body: parsedBody,
  });
}

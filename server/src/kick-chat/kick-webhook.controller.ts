import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { KickCommandRouter } from './kick-command.router.js';
import { KickWebhookVerifierService } from './kick-webhook-verifier.service.js';
import { kickMessageAuditFields, formatKickRouteAudit } from './kick-chat-audit.js';
import type { KickChatMessageEvent } from './kick-chat.types.js';

@Controller()
export class KickWebhookController {
  private readonly logger = new Logger(KickWebhookController.name);

  constructor(
    private readonly verifier: KickWebhookVerifierService,
    private readonly router: KickCommandRouter,
  ) {}

  private logKickPayload(payload: unknown): void {
    if (process.env.KICK_WEBHOOK_DEBUG === 'false') {
      return;
    }
    console.log(`[kick]\n${JSON.stringify(payload, null, 2)}`);
  }

  @Post('webhooks/kick')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('kick-event-message-id') messageId: string | undefined,
    @Headers('kick-event-message-timestamp') timestamp: string | undefined,
    @Headers('kick-event-signature') signature: string | undefined,
    @Headers('kick-event-type') eventType: string | undefined,
    @Body() body: unknown,
  ): Promise<{ ok: true }> {
    this.logger.log(
      `ingress POST /webhooks/kick eventType=${eventType ?? 'missing'} messageId=${messageId ?? 'missing'} hasRawBody=${Boolean(req.rawBody)}`,
    );

    if (!messageId || !timestamp || !signature || !eventType) {
      this.logger.warn(
        `rejected webhook: missing headers messageId=${messageId ?? 'missing'} eventType=${eventType ?? 'missing'}`,
      );
      throw new BadRequestException('Missing Kick webhook headers');
    }

    const rawBody = req.rawBody;
    if (!rawBody && !this.verifier.bypassesSignatureVerification()) {
      this.logger.warn(
        `rejected webhook: missing raw body messageId=${messageId}`,
      );
      throw new BadRequestException('Missing raw request body');
    }

    const rawBodyForVerify =
      rawBody ?? Buffer.from(JSON.stringify(body ?? {}));

    try {
      await this.verifier.verifySignature({
        messageId,
        timestamp,
        signature,
        rawBody: rawBodyForVerify,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const skipEnv = process.env.KICK_WEBHOOK_SKIP_VERIFY ?? '(unset)';
        this.logger.warn(
          `rejected webhook: invalid signature messageId=${messageId} eventType=${eventType} rawBodyBytes=${rawBodyForVerify.length} KICK_WEBHOOK_SKIP_VERIFY=${skipEnv} skipActive=${this.verifier.isSkipVerify()}`,
        );
      }
      throw error;
    }

    let parsedBody: unknown = body;
    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody.toString('utf8')) as unknown;
      } catch {
        parsedBody = rawBody.toString('utf8');
      }
    }

    this.logKickPayload({
      headers: {
        'kick-event-type': eventType,
        'kick-event-message-id': messageId,
        'kick-event-message-timestamp': timestamp,
        'kick-event-signature': signature,
      },
      body: parsedBody,
    });

    if (eventType !== 'chat.message.sent') {
      this.logger.debug(
        `ignored event type=${eventType} messageId=${messageId ?? 'unknown'}`,
      );
      return { ok: true };
    }

    const parseResult = this.parseChatMessageEvent(parsedBody, messageId);
    if (!parseResult.event) {
      this.logger.warn(
        `rejected chat.message.sent: ${parseResult.reason} messageId=${messageId ?? 'unknown'}`,
      );
      throw new BadRequestException('Invalid chat.message.sent payload');
    }

    const event = parseResult.event;
    this.logger.log(
      `received chat.message.sent ${JSON.stringify(kickMessageAuditFields(event))}`,
    );

    const routeResult = await this.router.routeChatMessage(event);
    this.logger.log(
      `handled chat.message.sent messageId=${event.message_id} ${formatKickRouteAudit(routeResult)}`,
    );
    return { ok: true };
  }

  @Post('dev/kick/chat')
  @HttpCode(200)
  async injectMockChatMessage(
    @Body() body: KickChatMessageEvent,
  ): Promise<{ ok: true; result: unknown }> {
    if (!this.verifier.isMockMode()) {
      throw new UnauthorizedException(
        'Mock chat injection requires KICK_CHAT_MOCK=true',
      );
    }

    if (!body?.message_id || !body?.broadcaster?.user_id || !body?.sender) {
      throw new BadRequestException('Invalid mock chat payload');
    }

    const result = await this.router.routeChatMessage(body);
    this.logger.log(
      `mock chat handled messageId=${body.message_id} ${formatKickRouteAudit(result)}`,
    );
    return { ok: true, result };
  }

  private parseChatMessageEvent(
    body: unknown,
    messageIdFromHeader?: string,
  ):
    | { event: KickChatMessageEvent; reason?: undefined }
    | { event: null; reason: string } {
    if (!body || typeof body !== 'object') {
      return { event: null, reason: 'body is not an object' };
    }

    const event = body as KickChatMessageEvent;
    if (!event.message_id && messageIdFromHeader) {
      event.message_id = messageIdFromHeader;
    }

    const missing: string[] = [];
    if (!event.message_id) {
      missing.push('message_id');
    }
    if (event.broadcaster?.user_id === undefined || event.broadcaster?.user_id === null) {
      missing.push('broadcaster.user_id');
    }
    if (event.sender?.user_id === undefined || event.sender?.user_id === null) {
      missing.push('sender.user_id');
    }
    if (!event.sender?.username) {
      missing.push('sender.username');
    }
    if (typeof event.content !== 'string') {
      missing.push('content (string)');
    }

    if (missing.length > 0) {
      return {
        event: null,
        reason: `missing or invalid fields: ${missing.join(', ')}`,
      };
    }

    return { event };
  }
}

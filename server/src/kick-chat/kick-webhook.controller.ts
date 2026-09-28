import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { KickCommandRouter } from './kick-command.router.js';
import { KickWebhookVerifierService } from './kick-webhook-verifier.service.js';
import type { KickChatMessageEvent } from './kick-chat.types.js';

@Controller()
export class KickWebhookController {
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
    if (!messageId || !timestamp || !signature || !eventType) {
      throw new BadRequestException('Missing Kick webhook headers');
    }

    const rawBody = req.rawBody;
    if (!rawBody && !this.verifier.isMockMode()) {
      throw new BadRequestException('Missing raw request body');
    }

    const rawBodyForVerify =
      rawBody ?? Buffer.from(JSON.stringify(body ?? {}));

    this.verifier.verifySignature({
      messageId,
      timestamp,
      signature,
      rawBody: rawBodyForVerify,
    });

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
      return { ok: true };
    }

    const event = this.parseChatMessageEvent(parsedBody, messageId);
    if (!event) {
      throw new BadRequestException('Invalid chat.message.sent payload');
    }

    await this.router.routeChatMessage(event);
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
    return { ok: true, result };
  }

  private parseChatMessageEvent(
    body: unknown,
    messageIdFromHeader?: string,
  ): KickChatMessageEvent | null {
    if (!body || typeof body !== 'object') {
      return null;
    }

    const event = body as KickChatMessageEvent;
    if (!event.message_id && messageIdFromHeader) {
      event.message_id = messageIdFromHeader;
    }
    if (
      !event.message_id ||
      !event.broadcaster?.user_id ||
      !event.sender?.user_id ||
      !event.sender.username ||
      typeof event.content !== 'string'
    ) {
      return null;
    }

    return event;
  }
}

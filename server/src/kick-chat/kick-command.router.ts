import { Injectable } from '@nestjs/common';
import { ChatRollIntakeHandler } from './handlers/chat-roll-intake.handler.js';
import { WinnerResponseHandler } from './handlers/winner-response.handler.js';
import type {
  KickChatMessageEvent,
  KickChatRouteResult,
} from './kick-chat.types.js';

@Injectable()
export class KickCommandRouter {
  constructor(
    private readonly winnerResponse: WinnerResponseHandler,
    private readonly chatRollIntake: ChatRollIntakeHandler,
  ) {}

  async routeChatMessage(
    event: KickChatMessageEvent,
  ): Promise<KickChatRouteResult> {
    const winnerResponse = await this.winnerResponse.handle(event);
    const intake =
      winnerResponse.action === 'confirmed'
        ? { action: 'ignored' as const, reason: 'winner_response_confirmed' }
        : await this.chatRollIntake.handle(event);

    return { winnerResponse, intake };
  }
}

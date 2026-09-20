import { Injectable } from '@nestjs/common';
import { ChatRollIntakeHandler } from './handlers/chat-roll-intake.handler.js';
import type {
  ChatRollIntakeResult,
  KickChatMessageEvent,
} from './kick-chat.types.js';

@Injectable()
export class KickCommandRouter {
  constructor(private readonly chatRollIntake: ChatRollIntakeHandler) {}

  async routeChatMessage(
    event: KickChatMessageEvent,
  ): Promise<ChatRollIntakeResult> {
    return this.chatRollIntake.handle(event);
  }
}

import { Controller, Get, Logger, Param } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { KickChatReplyService } from '../kick-chat/kick-chat-reply.service.js';
import { flushGrowingJackpotWinnerChatAnnouncements } from './growing-jackpot-winner-announce.js';
import { GrowingJackpotService } from './growing-jackpot.service.js';

@Controller('growing-jackpots')
export class GrowingJackpotController {
  private readonly logger = new Logger(GrowingJackpotController.name);

  constructor(
    private readonly growingJackpot: GrowingJackpotService,
    private readonly database: DatabaseService,
    private readonly chatReply: KickChatReplyService,
  ) {}

  @Get('widget/:ucid')
  async getPublicWidget(@Param('ucid') ucid: string) {
    const accountId = await this.database.getAccountIdByUcid(ucid);
    const payload = await this.growingJackpot.getPublicWidgetByUcid(ucid);

    if (accountId !== null) {
      const channel = await this.database.getKickChannelIdByAccountId(accountId);
      if (channel) {
        try {
          await flushGrowingJackpotWinnerChatAnnouncements({
            database: this.database,
            growingJackpot: this.growingJackpot,
            chatReply: this.chatReply,
            accountId,
            broadcasterUserId: channel,
          });
        } catch (error) {
          this.logger.error(
            'Winner chat announce flush failed; returning widget payload',
            error instanceof Error ? error.stack : error,
          );
        }
      }
    }

    return payload;
  }
}

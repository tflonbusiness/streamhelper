import { Controller, Get, Param } from '@nestjs/common';
import { FirstReactionService } from './first-reaction.service.js';

@Controller('first-reactions')
export class FirstReactionController {
  constructor(private readonly firstReaction: FirstReactionService) {}

  @Get('widget/:ucid')
  async getPublicWidget(@Param('ucid') ucid: string) {
    return this.firstReaction.getPublicWidgetByUcid(ucid);
  }
}

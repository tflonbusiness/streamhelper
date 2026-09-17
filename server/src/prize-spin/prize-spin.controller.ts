import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

@Controller('prize-spin')
export class PrizeSpinController {
  constructor(private readonly authService: AuthService) {}

  @Get('widget/:channelSlug')
  async getPublicWidget(@Param('channelSlug') channelSlug: string) {
    return this.authService.getPublicPrizeSpinWidgetByChannelSlug(channelSlug);
  }
}

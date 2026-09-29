import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

@Controller('bonus-buys')
export class BonusBuyController {
  constructor(private readonly authService: AuthService) {}

  @Get('widget/:ucid')
  async getPublicWidgetByUcid(@Param('ucid') ucid: string) {
    return this.authService.getPublicBonusBuyWidgetByUcid(ucid);
  }
}

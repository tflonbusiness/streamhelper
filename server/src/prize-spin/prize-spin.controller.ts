import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

@Controller('prize-spins')
export class PrizeSpinController {
  constructor(private readonly authService: AuthService) {}

  @Get('widget/:ucid')
  async getPublicWidgetByUcid(@Param('ucid') ucid: string) {
    return this.authService.getPublicPrizeSpinWidgetByUcid(ucid);
  }
}

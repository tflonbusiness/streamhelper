import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

@Controller('bonus-buys')
export class BonusBuyController {
  constructor(private readonly authService: AuthService) {}

  @Get(':bonusBuyId/widget')
  async getPublicWidget(@Param('bonusBuyId', ParseIntPipe) bonusBuyId: number) {
    return this.authService.getPublicBonusBuyWidget(bonusBuyId);
  }
}

import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

@Controller('prize-spins')
export class PrizeSpinController {
  constructor(private readonly authService: AuthService) {}

  @Get(':prizeSpinId/widget')
  async getPublicWidget(
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
  ) {
    return this.authService.getPublicPrizeSpinWidget(prizeSpinId);
  }
}

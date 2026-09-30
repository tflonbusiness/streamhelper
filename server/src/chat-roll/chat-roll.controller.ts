import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

@Controller('chat-rolls')
export class ChatRollController {
  constructor(private readonly authService: AuthService) {}

  @Get('widget/:ucid')
  async getPublicWidgetByUcid(@Param('ucid') ucid: string) {
    return this.authService.getPublicChatRollWidgetByUcid(ucid);
  }
}

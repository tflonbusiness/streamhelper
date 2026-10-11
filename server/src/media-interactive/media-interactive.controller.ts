import { Controller, Get, Param, Post } from '@nestjs/common';
import { MediaInteractiveService } from './media-interactive.service.js';

@Controller('media-interactive')
export class MediaInteractiveController {
  constructor(private readonly mediaInteractive: MediaInteractiveService) {}

  @Get('widget/:ucid')
  async getPublicWidget(@Param('ucid') ucid: string) {
    return this.mediaInteractive.getPublicWidgetByUcid(ucid);
  }

  @Post('widget/:ucid/complete')
  async completeCurrent(@Param('ucid') ucid: string) {
    return this.mediaInteractive.completePlaybackByUcid(ucid);
  }
}

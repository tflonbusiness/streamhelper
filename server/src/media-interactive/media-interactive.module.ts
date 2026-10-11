import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { KickRedemptionHandler } from './kick-redemption.handler.js';
import { MediaInteractiveController } from './media-interactive.controller.js';
import { MediaInteractiveService } from './media-interactive.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [MediaInteractiveController],
  providers: [MediaInteractiveService, KickRedemptionHandler],
  exports: [MediaInteractiveService, KickRedemptionHandler],
})
export class MediaInteractiveModule {}

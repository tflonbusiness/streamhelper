import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { KickChatModule } from '../kick-chat/kick-chat.module.js';
import { GrowingJackpotController } from './growing-jackpot.controller.js';
import { GrowingJackpotService } from './growing-jackpot.service.js';

@Module({
  imports: [DatabaseModule, forwardRef(() => KickChatModule)],
  controllers: [GrowingJackpotController],
  providers: [GrowingJackpotService],
  exports: [GrowingJackpotService],
})
export class GrowingJackpotModule {}

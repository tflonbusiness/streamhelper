import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChatRollController } from './chat-roll.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [ChatRollController],
})
export class ChatRollModule {}

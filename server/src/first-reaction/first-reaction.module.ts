import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { FirstReactionController } from './first-reaction.controller.js';
import { FirstReactionService } from './first-reaction.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [FirstReactionController],
  providers: [FirstReactionService],
  exports: [FirstReactionService],
})
export class FirstReactionModule {}

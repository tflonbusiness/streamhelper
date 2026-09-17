import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrizeSpinController } from './prize-spin.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [PrizeSpinController],
})
export class PrizeSpinModule {}

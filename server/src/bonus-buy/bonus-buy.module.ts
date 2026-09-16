import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BonusBuyController } from './bonus-buy.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [BonusBuyController],
})
export class BonusBuyModule {}

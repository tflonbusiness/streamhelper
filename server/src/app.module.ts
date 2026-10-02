import './load-env.js';
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AccountsModule } from './accounts/accounts.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BonusBuyModule } from './bonus-buy/bonus-buy.module.js';
import { DatabaseModule } from './database/database.module.js';
import { KickChatModule } from './kick-chat/kick-chat.module.js';
import { ChatRollModule } from './chat-roll/chat-roll.module.js';
import { InternalAdminModule } from './internal-admin/internal-admin.module.js';
import { PrizeSpinModule } from './prize-spin/prize-spin.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? '',
      appSecret: process.env.OBSERVE_APP_SECRET ?? '',
      serviceId: 'server',
    }),
    DatabaseModule,
    AuthModule,
    AccountsModule,
    BonusBuyModule,
    PrizeSpinModule,
    ChatRollModule,
    KickChatModule,
    InternalAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

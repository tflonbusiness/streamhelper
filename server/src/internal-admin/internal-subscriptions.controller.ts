import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import type { SessionData } from '../auth/auth.types.js';
import { InternalSubscriptionsService } from './internal-subscriptions.service.js';
import type { SubscriptionAdminUpdateBody } from './internal-subscriptions.types.js';
import { PlatformAdminService } from './platform-admin.service.js';

@Controller('internal/subscriptions')
export class InternalSubscriptionsController {
  constructor(
    private readonly authService: AuthService,
    private readonly platformAdmin: PlatformAdminService,
    private readonly subscriptions: InternalSubscriptionsService,
  ) {}

  private async requireOperator(req: Request) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    await this.platformAdmin.requirePlatformAdmin(user.id);
    return user;
  }

  @Get()
  async search(@Req() req: Request, @Query('q') q?: string) {
    await this.requireOperator(req);
    const items = await this.subscriptions.search(q ?? '');
    return { items };
  }

  @Get(':accountId')
  async detail(
    @Req() req: Request,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    await this.requireOperator(req);
    const account = await this.subscriptions.getDetail(accountId);
    return { account };
  }

  @Put(':accountId')
  async update(
    @Req() req: Request,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: SubscriptionAdminUpdateBody,
  ) {
    const operator = await this.requireOperator(req);
    const account = await this.subscriptions.updateSubscription(
      accountId,
      operator.id,
      body,
    );
    return { account };
  }
}

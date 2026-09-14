import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import type { SessionData } from '../auth/auth.types.js';

type CreateAdminBody = {
  name?: string;
};

@Controller('accounts')
export class AccountsController {
  constructor(private readonly authService: AuthService) {}

  @Get(':accountId/kick/channel')
  async getKickChannel(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.getKickChannel(accountId, user.id);
  }

  @Get(':accountId/members')
  async listMembers(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    const members = await this.authService.getAccountMembers(
      accountId,
      user.id,
    );
    return { members };
  }

  @Post(':accountId/admins')
  async createAdmin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: CreateAdminBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    this.authService.requireAccountContext(user);

    const name = body.name ?? '';
    const result = await this.authService.createAdmin(
      accountId,
      user.id,
      name,
    );

    return result;
  }

  @Get(':accountId/members/:memberUserId/invite-link')
  async getInviteLink(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.getAdminInviteLink(
      accountId,
      user.id,
      memberUserId,
    );
  }

  @Delete(':accountId/members/:memberUserId')
  async revokeMember(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.revokeAdmin(accountId, user.id, memberUserId);
    return { ok: true };
  }
}

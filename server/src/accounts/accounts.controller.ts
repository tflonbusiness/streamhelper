import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import type { SessionData } from '../auth/auth.types.js';

type CreateAdminBody = {
  name?: string;
};

type CreateBonusBuyBody = {
  title?: string;
  start_balance?: string;
};

type PatchBonusBuyBody = {
  title?: string;
  start_balance?: string;
};

type CreateBonusBuySlotBody = {
  slot_name?: string;
  nick_provider?: string;
  purchase_amount?: string;
};

type PatchBonusBuySlotBody = {
  slot_name?: string;
  nick_provider?: string | null;
  purchase_amount?: string;
  win_amount?: string | null;
  is_now_playing?: boolean;
};

type PatchBonusBuyWidgetBody = {
  width?: number;
  height?: number;
  background_color?: string;
  surface_color?: string;
  border_color?: string;
  accent_color?: string;
  positive_color?: string;
  negative_color?: string;
  live_color?: string;
  text_muted_color?: string;
  border_radius?: number;
  padding?: number;
  font_family?: string;
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

  @Get(':accountId/bonus-buys')
  async listBonusBuys(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    const records = await this.authService.listBonusBuys(accountId, user.id);
    return { records };
  }

  @Get(':accountId/bonus-buys/:bonusBuyId')
  async getBonusBuy(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.getBonusBuy(accountId, user.id, bonusBuyId);
  }

  @Post(':accountId/bonus-buys')
  async createBonusBuy(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: CreateBonusBuyBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    const record = await this.authService.createBonusBuy(
      accountId,
      user.id,
      body.title ?? '',
      body.start_balance ?? '',
    );

    return record;
  }

  @Patch(':accountId/bonus-buys/:bonusBuyId')
  async patchBonusBuy(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Body() body: PatchBonusBuyBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.updateBonusBuy(
      accountId,
      user.id,
      bonusBuyId,
      body,
    );
  }

  @Get(':accountId/bonus-buy-widget')
  async getBonusBuyWidget(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.getBonusBuyWidget(accountId, user.id);
  }

  @Patch(':accountId/bonus-buy-widget')
  async patchBonusBuyWidget(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: PatchBonusBuyWidgetBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.patchBonusBuyWidget(accountId, user.id, body);
  }

  @Get(':accountId/bonus-buys/:bonusBuyId/slots')
  async listBonusBuySlots(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.listBonusBuySlots(accountId, user.id, bonusBuyId);
  }

  @Post(':accountId/bonus-buys/:bonusBuyId/slots')
  async createBonusBuySlot(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Body() body: CreateBonusBuySlotBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.createBonusBuySlot(
      accountId,
      user.id,
      bonusBuyId,
      body.slot_name ?? '',
      body.nick_provider,
      body.purchase_amount ?? '',
    );
  }

  @Patch(':accountId/bonus-buys/:bonusBuyId/slots/:slotId')
  async patchBonusBuySlot(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Param('slotId', ParseIntPipe) slotId: number,
    @Body() body: PatchBonusBuySlotBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.patchBonusBuySlot(
      accountId,
      user.id,
      bonusBuyId,
      slotId,
      body,
    );
  }

  @Delete(':accountId/bonus-buys/:bonusBuyId/slots/:slotId')
  @HttpCode(204)
  async archiveBonusBuySlot(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Param('slotId', ParseIntPipe) slotId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archiveBonusBuySlot(
      accountId,
      user.id,
      bonusBuyId,
      slotId,
    );
  }

  @Post(':accountId/bonus-buys/:bonusBuyId/end')
  async endBonusBuy(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.endBonusBuy(accountId, user.id, bonusBuyId);
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

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
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import type { SessionData } from '../auth/auth.types.js';

type CreateModeratorBody = {
  name?: string;
};

type CreateBonusBuyBody = {
  name?: string;
  start_balance?: string;
  currency_code?: string;
};

type PatchBonusBuyBody = {
  name?: string;
  start_balance?: string;
  currency_code?: string;
};

type CreateBonusBuySlotBody = {
  name?: string;
  provider_name?: string;
  purchase_amount?: string;
};

type PatchBonusBuySlotBody = {
  name?: string;
  provider_name?: string | null;
  purchase_amount?: string;
  win_amount?: string | null;
  status?: 'pending' | 'playing' | 'archived';
};

type PatchBonusBuyWidgetBody = {
  width?: number;
  height?: number;
  preset_id?: number | null;
};

type UpsertBonusBuyWidgetCustomPresetBody = {
  style_settings?: Record<string, unknown>;
};

type CreatePrizeSpinBody = {
  title?: string;
};

type CreatePrizeSpinSectorBody = {
  label?: string;
  win_percent?: string | number;
  color?: string;
};

type PatchPrizeSpinSectorBody = {
  label?: string;
  win_percent?: string | number;
  color?: string | null;
};

type SpinPrizeSpinBody = {
  participant_nick?: string;
};

type PatchPrizeSpinWidgetBody = {
  width?: number;
  height?: number;
  equalSectorSlices?: boolean;
};

type CreateChatRollBody = {
  title?: string;
};

type PatchChatRollBody = {
  title?: string;
  keyword?: string;
  combine_mode?: string;
  exclude_winner_after_roll?: boolean;
  is_accepting_participants?: boolean;
  reply_in_chat?: boolean;
  winner_response_enabled?: boolean;
  winner_response_seconds?: number;
  role_settings?: unknown;
};

type PatchChatRollWidgetBody = {
  width?: number;
  height?: number;
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

  @Post(':accountId/moderators')
  async createModerator(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: CreateModeratorBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    this.authService.requireAccountContext(user);

    const name = body.name ?? '';
    const result = await this.authService.createModerator(
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

    return this.authService.getModeratorInviteLink(
      accountId,
      user.id,
      memberUserId,
    );
  }

  @Get(':accountId/bonus-buys')
  async listBonusBuys(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('archived') archived: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.listBonusBuys(
      accountId,
      user.id,
      archived,
      page,
      limit,
    );
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
      body.name ?? '',
      body.start_balance ?? '',
      body.currency_code ?? 'USD',
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

  @Get(':accountId/bonus-buys/:bonusBuyId/widget')
  async getBonusBuyWidget(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.getBonusBuyWidget(accountId, user.id, bonusBuyId);
  }

  @Patch(':accountId/bonus-buys/:bonusBuyId/widget')
  async patchBonusBuyWidget(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Body() body: PatchBonusBuyWidgetBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.patchBonusBuyWidget(
      accountId,
      user.id,
      bonusBuyId,
      body,
    );
  }

  @Get(':accountId/bonus-buy-widget-presets')
  async listBonusBuyWidgetPresets(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.listBonusBuyWidgetPresets(accountId, user.id);
  }

  @Put(':accountId/bonus-buy-widget-presets/custom')
  async upsertBonusBuyWidgetCustomPreset(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: UpsertBonusBuyWidgetCustomPresetBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.upsertBonusBuyWidgetCustomPreset(
      accountId,
      user.id,
      body,
    );
  }

  @Delete(':accountId/bonus-buy-widget-presets/custom')
  @HttpCode(204)
  async deleteBonusBuyWidgetCustomPreset(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    await this.authService.deleteBonusBuyWidgetCustomPreset(accountId, user.id);
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
      body.name ?? '',
      body.provider_name,
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

  @Post(':accountId/bonus-buys/:bonusBuyId/go-live')
  async goLiveBonusBuy(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('bonusBuyId', ParseIntPipe) bonusBuyId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.goLiveBonusBuy(accountId, user.id, bonusBuyId);
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

  @Get(':accountId/prize-spins')
  async listPrizeSpins(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('archived') archived: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.listPrizeSpins(
      accountId,
      user.id,
      archived,
      page,
      limit,
    );
  }

  @Get(':accountId/prize-spins/:prizeSpinId')
  async getPrizeSpin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.getPrizeSpin(accountId, user.id, prizeSpinId);
  }

  @Post(':accountId/prize-spins')
  async createPrizeSpin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: CreatePrizeSpinBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.createPrizeSpin(
      accountId,
      user.id,
      body.title ?? '',
    );
  }

  @Delete(':accountId/prize-spins/:prizeSpinId')
  @HttpCode(204)
  async archivePrizeSpin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archivePrizeSpin(accountId, user.id, prizeSpinId);
  }

  @Post(':accountId/prize-spins/:prizeSpinId/go-live')
  async goLivePrizeSpin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.goLivePrizeSpin(accountId, user.id, prizeSpinId);
  }

  @Post(':accountId/prize-spins/:prizeSpinId/copy')
  @HttpCode(201)
  async copyPrizeSpin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Body() body: CreatePrizeSpinBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.copyPrizeSpin(
      accountId,
      user.id,
      prizeSpinId,
      body.title ?? '',
    );
  }

  @Get(':accountId/prize-spins/:prizeSpinId/sectors')
  async listPrizeSpinSectors(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.listPrizeSpinSectors(
      accountId,
      user.id,
      prizeSpinId,
    );
  }

  @Post(':accountId/prize-spins/:prizeSpinId/sectors')
  async createPrizeSpinSector(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Body() body: CreatePrizeSpinSectorBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.createPrizeSpinSector(
      accountId,
      user.id,
      prizeSpinId,
      body.label ?? '',
      body.win_percent?.toString() ?? '',
      body.color,
    );
  }

  @Post(':accountId/prize-spins/:prizeSpinId/sectors/distribute-equally')
  async distributePrizeSpinSectorsEqually(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.distributePrizeSpinSectorsEqually(
      accountId,
      user.id,
      prizeSpinId,
    );
  }

  @Patch(':accountId/prize-spins/:prizeSpinId/sectors/:sectorId')
  async patchPrizeSpinSector(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Param('sectorId', ParseIntPipe) sectorId: number,
    @Body() body: PatchPrizeSpinSectorBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.patchPrizeSpinSector(
      accountId,
      user.id,
      prizeSpinId,
      sectorId,
      body,
    );
  }

  @Delete(':accountId/prize-spins/:prizeSpinId/sectors/:sectorId')
  @HttpCode(204)
  async archivePrizeSpinSector(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Param('sectorId', ParseIntPipe) sectorId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archivePrizeSpinSector(
      accountId,
      user.id,
      prizeSpinId,
      sectorId,
    );
  }

  @Get(':accountId/prize-spins/:prizeSpinId/wins')
  async listPrizeSpinWins(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.listPrizeSpinWins(accountId, user.id, prizeSpinId);
  }

  @Delete(':accountId/prize-spins/:prizeSpinId/wins')
  @HttpCode(204)
  async archiveAllPrizeSpinWins(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archiveAllPrizeSpinWins(
      accountId,
      user.id,
      prizeSpinId,
    );
  }

  @Delete(':accountId/prize-spins/:prizeSpinId/wins/:winId')
  @HttpCode(204)
  async archivePrizeSpinWin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Param('winId', ParseIntPipe) winId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archivePrizeSpinWin(
      accountId,
      user.id,
      prizeSpinId,
      winId,
    );
  }

  @Post(':accountId/prize-spins/:prizeSpinId/spin')
  async spinPrizeSpin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('prizeSpinId', ParseIntPipe) prizeSpinId: number,
    @Body() body: SpinPrizeSpinBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.spinPrizeSpin(
      accountId,
      user.id,
      prizeSpinId,
      body.participant_nick ?? '',
    );
  }

  @Get(':accountId/prize-spin-widget')
  async getPrizeSpinWidget(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.getPrizeSpinWidget(accountId, user.id);
  }

  @Patch(':accountId/prize-spin-widget')
  async patchPrizeSpinWidget(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: PatchPrizeSpinWidgetBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.patchPrizeSpinWidget(accountId, user.id, body);
  }

  @Get(':accountId/chat-rolls')
  async listChatRolls(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('archived') archived: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.listChatRolls(
      accountId,
      user.id,
      archived,
      page,
      limit,
    );
  }

  @Get(':accountId/chat-rolls/:chatRollId')
  async getChatRoll(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.getChatRoll(accountId, user.id, chatRollId);
  }

  @Post(':accountId/chat-rolls')
  async createChatRoll(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: CreateChatRollBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.createChatRoll(
      accountId,
      user.id,
      body.title ?? '',
    );
  }

  @Patch(':accountId/chat-rolls/:chatRollId')
  async patchChatRoll(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Body() body: PatchChatRollBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.patchChatRoll(
      accountId,
      user.id,
      chatRollId,
      body,
    );
  }

  @Delete(':accountId/chat-rolls/:chatRollId')
  @HttpCode(204)
  async archiveChatRoll(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archiveChatRoll(accountId, user.id, chatRollId);
  }

  @Post(':accountId/chat-rolls/:chatRollId/go-live')
  async goLiveChatRoll(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.goLiveChatRoll(accountId, user.id, chatRollId);
  }

  @Post(':accountId/chat-rolls/:chatRollId/deactivate')
  async deactivateChatRoll(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.deactivateChatRoll(accountId, user.id, chatRollId);
  }

  @Get(':accountId/chat-rolls/:chatRollId/participants')
  async listChatRollParticipants(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.listChatRollParticipants(
      accountId,
      user.id,
      chatRollId,
    );
  }

  @Delete(':accountId/chat-rolls/:chatRollId/participants')
  @HttpCode(204)
  async archiveAllChatRollParticipants(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archiveAllChatRollParticipants(
      accountId,
      user.id,
      chatRollId,
    );
  }

  @Delete(':accountId/chat-rolls/:chatRollId/participants/:participantId')
  @HttpCode(204)
  async archiveChatRollParticipant(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Param('participantId', ParseIntPipe) participantId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archiveChatRollParticipant(
      accountId,
      user.id,
      chatRollId,
      participantId,
    );
  }

  @Get(':accountId/chat-rolls/:chatRollId/wins')
  async listChatRollWins(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.listChatRollWins(accountId, user.id, chatRollId);
  }

  @Delete(':accountId/chat-rolls/:chatRollId/wins')
  @HttpCode(204)
  async archiveAllChatRollWins(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archiveAllChatRollWins(
      accountId,
      user.id,
      chatRollId,
    );
  }

  @Delete(':accountId/chat-rolls/:chatRollId/wins/:winId')
  @HttpCode(204)
  async archiveChatRollWin(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Param('winId', ParseIntPipe) winId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.archiveChatRollWin(
      accountId,
      user.id,
      chatRollId,
      winId,
    );
  }

  @Post(':accountId/chat-rolls/:chatRollId/roll')
  async rollChatRoll(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('chatRollId', ParseIntPipe) chatRollId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    return this.authService.rollChatRoll(accountId, user.id, chatRollId);
  }

  @Get(':accountId/chat-roll-widget')
  async getChatRollWidget(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.getChatRollWidget(accountId, user.id);
  }

  @Patch(':accountId/chat-roll-widget')
  async patchChatRollWidget(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: PatchChatRollWidgetBody,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    return this.authService.patchChatRollWidget(accountId, user.id, body);
  }

  @Delete(':accountId/members/:memberUserId')
  async revokeMember(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
    @Req() req: Request,
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);

    await this.authService.revokeModerator(accountId, user.id, memberUserId);
    return { ok: true };
  }
}

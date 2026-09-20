import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DatabaseService,
  type DbBonusBuy,
  type DbBonusBuySlot,
  type DbBonusBuyWidget,
  type DbMembership,
  type PatchBonusBuySlotInput,
  type PatchPrizeSpinSectorInput,
  type DbPrizeSpinSector,
  type DbPrizeSpinWin,
  type DbPrizeSpinWidget,
  type PrizeSpinStatus,
} from '../database/database.service.js';
import { KickEventsService } from '../kick-chat/kick-events.service.js';
import { KickChannelService } from './kick-channel.service.js';
import type { KickChannelDto } from './kick-channel.types.js';
import { KickOAuthService } from './kick-oauth.service.js';
import type { CreateModeratorResult, KickProfile, SessionUser } from './auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly kickOAuth: KickOAuthService,
    private readonly kickChannel: KickChannelService,
    private readonly kickEvents: KickEventsService,
  ) {}

  getAppBaseUrl(): string {
    return process.env.APP_URL ?? 'http://localhost:5173';
  }

  buildSessionUser(
    id: number,
    name: string,
    membership?: DbMembership,
    channelSlug?: string,
  ): SessionUser {
    if (!membership) {
      return { id, name };
    }

    return {
      id,
      name,
      accountId: membership.accountId,
      accountName: membership.name,
      role: membership.role,
      subscriptionPlan: membership.subscriptionPlan,
      ucid: membership.ucid,
      channelSlug,
    };
  }

  private async resolveChannelSlug(accountId: number): Promise<string | undefined> {
    const channel = await this.database.getPrimaryKickChannel(accountId);
    return channel?.channelSlug;
  }

  async enrichSessionUser(user: SessionUser): Promise<SessionUser> {
    if (!user.accountId) {
      return user;
    }

    const channelSlug =
      user.channelSlug ?? (await this.resolveChannelSlug(user.accountId));
    const ucid =
      user.ucid ?? (await this.database.getAccountUcid(user.accountId));

    if (channelSlug === user.channelSlug && ucid === user.ucid) {
      return user;
    }

    return {
      ...user,
      ...(channelSlug ? { channelSlug } : {}),
      ...(ucid ? { ucid } : {}),
    };
  }

  async establishSessionForUserId(userId: number): Promise<SessionUser> {
    const active = await this.database.hasActiveCredentials(userId);
    if (!active) {
      throw new UnauthorizedException('Credentials revoked');
    }

    const user = await this.database.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const membership = await this.database.getPrimaryMembership(userId);
    if (!membership) {
      throw new UnauthorizedException('No active membership');
    }

    const channelSlug = await this.resolveChannelSlug(membership.accountId);
    return this.buildSessionUser(user.id, user.name, membership, channelSlug);
  }

  async handleKickCallback(
    code: string,
    codeVerifier?: string,
  ): Promise<SessionUser> {
    const { profile, accessToken } = await this.kickOAuth.exchangeCodeForProfile(
      code,
      codeVerifier,
    );
    const { userId, membership } =
      await this.database.provisionOwnerFromKick(profile);

    await this.kickEvents.subscribeToChatMessages({
      broadcasterUserId: profile.channelId,
      userAccessToken: accessToken,
    });

    const credential = await this.database.findCredentialByProvider(
      'kick',
      profile.providerUserId,
    );
    if (!credential?.isActive) {
      throw new UnauthorizedException('Credentials revoked');
    }

    const user = await this.database.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const channelSlug = await this.resolveChannelSlug(membership.accountId);
    return this.buildSessionUser(user.id, user.name, membership, channelSlug);
  }

  async handleJoinToken(token: string): Promise<SessionUser> {
    const userId = await this.database.findAccessLinkUserIdByToken(token);
    if (!userId) {
      throw new UnauthorizedException('Invalid or revoked link');
    }

    return this.establishSessionForUserId(userId);
  }

  async createModerator(
    accountId: number,
    ownerUserId: number,
    name: string,
  ): Promise<CreateModeratorResult> {
    try {
      const result = await this.database.createModeratorWithAccessLink(
        accountId,
        ownerUserId,
        name,
        this.getAppBaseUrl(),
      );
      return {
        userId: result.userId,
        name: result.name,
        joinUrl: result.joinUrl,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'FORBIDDEN') {
          throw new ForbiddenException('Only account owner can create moderators');
        }
        if (error.message === 'INVALID_MODERATOR_NAME') {
          throw new BadRequestException('Name must be 2-100 characters');
        }
      }
      throw error;
    }
  }

  async revokeModerator(
    accountId: number,
    ownerUserId: number,
    moderatorUserId: number,
  ): Promise<void> {
    try {
      await this.database.revokeModeratorPermanently(
        accountId,
        ownerUserId,
        moderatorUserId,
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'FORBIDDEN') {
          throw new ForbiddenException('Only account owner can revoke moderators');
        }
        if (error.message === 'MODERATOR_NOT_FOUND') {
          throw new NotFoundException('Moderator not found');
        }
      }
      throw error;
    }
  }

  async getBonusBuy(
    accountId: number,
    callerUserId: number,
    bonusBuyId: number,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    const row = await this.database.getBonusBuyById(accountId, bonusBuyId);
    if (!row) {
      throw new NotFoundException('Bonus buy not found');
    }

    return {
      id: row.id,
      accountId: row.accountId,
      title: row.title,
      startBalance: row.startBalance,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
    };
  }

  async listBonusBuys(accountId: number, callerUserId: number) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    const rows = await this.database.listBonusBuys(accountId);
    return rows.map((row) => ({
      id: row.id,
      accountId: row.accountId,
      title: row.title,
      startBalance: row.startBalance,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
    }));
  }

  async createBonusBuy(
    accountId: number,
    callerUserId: number,
    title: string,
    startBalance: string,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    try {
      const row = await this.database.createBonusBuy(
        accountId,
        callerUserId,
        title,
        startBalance,
      );
      return {
        id: row.id,
        accountId: row.accountId,
        title: row.title,
        startBalance: row.startBalance,
        isActive: row.isActive,
        createdAt: row.createdAt.toISOString(),
        createdByUserId: row.createdByUserId,
        createdByName: row.createdByName,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_TITLE') {
          throw new BadRequestException('Title must be 1-200 characters');
        }
        if (error.message === 'INVALID_START_BALANCE') {
          throw new BadRequestException(
            'Start balance must be zero or a positive number with up to 2 decimal places',
          );
        }
      }
      throw error;
    }
  }

  async endBonusBuy(
    accountId: number,
    callerUserId: number,
    bonusBuyId: number,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    try {
      const row = await this.database.endBonusBuy(accountId, bonusBuyId);
      return {
        id: row.id,
        accountId: row.accountId,
        title: row.title,
        startBalance: row.startBalance,
        isActive: row.isActive,
        createdAt: row.createdAt.toISOString(),
        createdByUserId: row.createdByUserId,
        createdByName: row.createdByName,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          throw new NotFoundException('Bonus buy not found');
        }
        if (error.message === 'ALREADY_ENDED') {
          throw new BadRequestException('Bonus buy session has already ended');
        }
      }
      throw error;
    }
  }

  private formatBonusBuy(row: DbBonusBuy) {
    return {
      id: row.id,
      accountId: row.accountId,
      title: row.title,
      startBalance: row.startBalance,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
    };
  }

  private formatBonusBuySlot(row: DbBonusBuySlot) {
    return {
      id: row.id,
      bonusBuyId: row.bonusBuyId,
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
      slotName: row.slotName,
      nickProvider: row.nickProvider,
      purchaseAmount: row.purchaseAmount,
      winAmount: row.winAmount,
      multiplier: row.multiplier,
      isNowPlaying: row.isNowPlaying,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private formatBonusBuyWidget(row: DbBonusBuyWidget) {
    return {
      id: row.id,
      accountId: row.accountId,
      width: row.width,
      height: row.height,
      backgroundColor: row.backgroundColor,
      surfaceColor: row.surfaceColor,
      borderColor: row.borderColor,
      accentColor: row.accentColor,
      positiveColor: row.positiveColor,
      negativeColor: row.negativeColor,
      liveColor: row.liveColor,
      textMutedColor: row.textMutedColor,
      borderRadius: row.borderRadius,
      padding: row.padding,
      fontFamily: row.fontFamily,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapWidgetMutationError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundException('Bonus buy widget settings not found');
      }
      if (error.message.startsWith('INVALID_WIDGET_COLOR:')) {
        throw new BadRequestException('Color must be a valid hex value (#RGB or #RRGGBB)');
      }
      if (error.message === 'INVALID_WIDGET_FONT_FAMILY') {
        throw new BadRequestException('Font family must be 1-200 characters');
      }
    }
    throw error;
  }

  private async requireAccountMember(accountId: number, callerUserId: number) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }
  }

  private formatPrizeSpinSector(row: DbPrizeSpinSector) {
    return {
      id: row.id,
      prizeSpinId: row.prizeSpinId,
      label: row.label,
      winPercent: row.winPercent,
      color: row.color,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private formatPrizeSpinWin(row: DbPrizeSpinWin) {
    return {
      id: row.id,
      prizeSpinId: row.prizeSpinId,
      sectorId: row.sectorId,
      sectorLabel: row.sectorLabel,
      participantNick: row.participantNick,
      spunByName: row.spunByName,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private mapPrizeSpinMutationError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin resource not found');
      }
      if (error.message === 'INVALID_LABEL') {
        throw new BadRequestException('Label must be 1-100 characters');
      }
      if (error.message === 'INVALID_WIN_PERCENT') {
        throw new BadRequestException(
          'Win percent must be greater than 0 and at most 100 with up to 2 decimal places',
        );
      }
      if (error.message === 'WIN_PERCENT_SUM_EXCEEDED') {
        throw new BadRequestException(
          'Total win percent for active sectors cannot exceed 100',
        );
      }
      if (error.message === 'WIN_PERCENT_SUM_INCOMPLETE') {
        throw new BadRequestException(
          'Sector win percentages must total 100% before spinning',
        );
      }
      if (error.message === 'INVALID_COLOR') {
        throw new BadRequestException('Color must be a valid #RRGGBB hex value');
      }
      if (error.message === 'INVALID_PARTICIPANT_NICK') {
        throw new BadRequestException(
          'Participant nick must be 1-100 characters',
        );
      }
      if (error.message === 'INSUFFICIENT_SECTORS') {
        throw new BadRequestException(
          'At least two wheel sectors are required to spin',
        );
      }
      if (error.message === 'NO_SECTORS') {
        throw new BadRequestException('Add at least one wheel sector first');
      }
    }
    throw error;
  }

  private mapSlotMutationError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundException('Bonus buy slot not found');
      }
      if (error.message === 'INVALID_SLOT_NAME') {
        throw new BadRequestException('Slot name must be 1-200 characters');
      }
      if (error.message === 'INVALID_SIGNED_AMOUNT') {
        throw new BadRequestException(
          'Amount must be a number with up to 2 decimal places',
        );
      }
      if (
        error.message === 'INVALID_AMOUNT' ||
        error.message === 'INVALID_PURCHASE_AMOUNT'
      ) {
        throw new BadRequestException(
          'Amount must be a positive number with up to 2 decimal places',
        );
      }
    }
    throw error;
  }

  async updateBonusBuy(
    accountId: number,
    callerUserId: number,
    bonusBuyId: number,
    updates: { title?: string; start_balance?: string },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    if (updates.title === undefined && updates.start_balance === undefined) {
      throw new BadRequestException('At least one field is required');
    }

    try {
      const row = await this.database.updateBonusBuy(accountId, bonusBuyId, {
        title: updates.title,
        startBalance: updates.start_balance,
      });
      return this.formatBonusBuy(row);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          throw new NotFoundException('Bonus buy not found');
        }
        if (error.message === 'INVALID_TITLE') {
          throw new BadRequestException('Title must be 1-200 characters');
        }
        if (error.message === 'INVALID_AMOUNT') {
          throw new BadRequestException(
            'Start balance must be a positive number with up to 2 decimal places',
          );
        }
      }
      throw error;
    }
  }

  async listBonusBuySlots(
    accountId: number,
    callerUserId: number,
    bonusBuyId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const rows = await this.database.listBonusBuySlots(accountId, bonusBuyId);
      return rows.map((row) => this.formatBonusBuySlot(row));
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Bonus buy not found');
      }
      throw error;
    }
  }

  async createBonusBuySlot(
    accountId: number,
    callerUserId: number,
    bonusBuyId: number,
    slotName: string,
    nickProvider: string | undefined,
    purchaseAmount: string,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.createBonusBuySlot(
        accountId,
        bonusBuyId,
        callerUserId,
        slotName,
        nickProvider ?? null,
        purchaseAmount,
      );
      return this.formatBonusBuySlot(row);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Bonus buy not found');
      }
      this.mapSlotMutationError(error);
    }
  }

  async patchBonusBuySlot(
    accountId: number,
    callerUserId: number,
    bonusBuyId: number,
    slotId: number,
    body: {
      slot_name?: string;
      nick_provider?: string | null;
      purchase_amount?: string;
      win_amount?: string | null;
      is_now_playing?: boolean;
    },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const input: PatchBonusBuySlotInput = {};
    if (body.slot_name !== undefined) {
      input.slotName = body.slot_name;
    }
    if (body.nick_provider !== undefined) {
      input.nickProvider = body.nick_provider;
    }
    if (body.purchase_amount !== undefined) {
      input.purchaseAmount = body.purchase_amount;
    }
    if (body.win_amount !== undefined) {
      input.winAmount = body.win_amount;
    }
    if (body.is_now_playing !== undefined) {
      input.isNowPlaying = body.is_now_playing;
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    try {
      const row = await this.database.patchBonusBuySlot(
        accountId,
        bonusBuyId,
        slotId,
        input,
      );
      return this.formatBonusBuySlot(row);
    } catch (error) {
      this.mapSlotMutationError(error);
    }
  }

  async archiveBonusBuySlot(
    accountId: number,
    callerUserId: number,
    bonusBuyId: number,
    slotId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archiveBonusBuySlot(accountId, bonusBuyId, slotId);
    } catch (error) {
      this.mapSlotMutationError(error);
    }
  }

  async getBonusBuyWidget(accountId: number, callerUserId: number) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.getBonusBuyWidget(accountId);
      return this.formatBonusBuyWidget(row);
    } catch (error) {
      this.mapWidgetMutationError(error);
    }
  }

  async patchBonusBuyWidget(
    accountId: number,
    callerUserId: number,
    body: {
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
    },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const input = {
      width: body.width,
      height: body.height,
      backgroundColor: body.background_color,
      surfaceColor: body.surface_color,
      borderColor: body.border_color,
      accentColor: body.accent_color,
      positiveColor: body.positive_color,
      negativeColor: body.negative_color,
      liveColor: body.live_color,
      textMutedColor: body.text_muted_color,
      borderRadius: body.border_radius,
      padding: body.padding,
      fontFamily: body.font_family,
    };

    const defined = Object.entries(input).filter(([, value]) => value !== undefined);
    if (defined.length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    try {
      const row = await this.database.patchBonusBuyWidget(accountId, input);
      return this.formatBonusBuyWidget(row);
    } catch (error) {
      this.mapWidgetMutationError(error);
    }
  }

  async getPublicBonusBuyWidget(bonusBuyId: number) {
    const view = await this.database.getPublicBonusBuyWidgetView(bonusBuyId);
    if (!view) {
      throw new NotFoundException('Bonus buy not found');
    }

    return {
      record: {
        id: view.record.id,
        title: view.record.title,
        startBalance: view.record.startBalance,
        isActive: view.record.isActive,
      },
      slots: view.slots.map((row) => this.formatBonusBuySlot(row)),
      settings: this.formatBonusBuyWidget(view.settings),
    };
  }

  private formatPrizeSpinWidget(row: DbPrizeSpinWidget) {
    return {
      id: row.id,
      accountId: row.accountId,
      width: row.width,
      height: row.height,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapPrizeSpinWidgetMutationError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin widget settings not found');
      }
    }
    throw error;
  }

  async getPrizeSpinWidget(accountId: number, callerUserId: number) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.getPrizeSpinWidget(accountId);
      return this.formatPrizeSpinWidget(row);
    } catch (error) {
      this.mapPrizeSpinWidgetMutationError(error);
    }
  }

  async patchPrizeSpinWidget(
    accountId: number,
    callerUserId: number,
    body: { width?: number; height?: number },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const input = {
      width: body.width,
      height: body.height,
    };

    const defined = Object.entries(input).filter(([, value]) => value !== undefined);
    if (defined.length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    try {
      const row = await this.database.patchPrizeSpinWidget(accountId, input);
      return this.formatPrizeSpinWidget(row);
    } catch (error) {
      this.mapPrizeSpinWidgetMutationError(error);
    }
  }

  private formatPublicPrizeSpinWidgetView(
    view: NonNullable<
      Awaited<ReturnType<DatabaseService['getPublicPrizeSpinWidgetView']>>
    >,
  ) {
    return {
      record: {
        id: view.record.id,
        title: view.record.title,
        isActive: view.record.status === 'live',
      },
      sectors: view.sectors.map((row) => this.formatPrizeSpinSector(row)),
      latestWin: view.latestWin
        ? {
            id: view.latestWin.id,
            sectorId: view.latestWin.sectorId,
            sectorLabel: view.latestWin.sectorLabel,
            participantNick: view.latestWin.participantNick,
            createdAt: view.latestWin.createdAt.toISOString(),
          }
        : null,
      settings: {
        width: view.settings.width,
        height: view.settings.height,
      },
    };
  }

  async getPublicPrizeSpinWidgetByUcid(ucid: string) {
    const view =
      await this.database.getPublicPrizeSpinWidgetViewByUcid(ucid);

    if (view === 'NOT_FOUND') {
      throw new NotFoundException('Prize spin not found');
    }
    if (view === 'NOT_LIVE') {
      throw new ConflictException('NOT_LIVE');
    }

    return this.formatPublicPrizeSpinWidgetView(view);
  }

  async getAccountMembers(accountId: number, callerUserId: number) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    return this.database.listAccountMembers(accountId);
  }

  async getKickChannel(
    accountId: number,
    callerUserId: number,
  ): Promise<KickChannelDto> {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    return this.kickChannel.getChannelForAccount(accountId);
  }

  async getModeratorInviteLink(
    accountId: number,
    ownerUserId: number,
    moderatorUserId: number,
  ): Promise<{ joinUrl: string }> {
    try {
      return await this.database.rotateModeratorInviteLink(
        accountId,
        ownerUserId,
        moderatorUserId,
        this.getAppBaseUrl(),
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'FORBIDDEN') {
          throw new ForbiddenException('Only account owner can copy invite links');
        }
        if (error.message === 'MODERATOR_NOT_FOUND') {
          throw new NotFoundException('Moderator not found');
        }
        if (error.message === 'INVITE_LINK_NOT_FOUND') {
          throw new NotFoundException('Invite link not available for this moderator');
        }
      }
      throw error;
    }
  }

  async requireValidSessionUser(
    user: SessionUser | undefined,
  ): Promise<SessionUser> {
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const active = await this.database.hasActiveCredentials(user.id);
    if (!active) {
      throw new UnauthorizedException('Credentials revoked');
    }

    return user;
  }

  requireAccountContext(user: SessionUser): SessionUser {
    if (!user.accountId || !user.role) {
      throw new BadRequestException('No account context');
    }
    return user;
  }

  async getPrizeSpin(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    const row = await this.database.getPrizeSpinById(accountId, prizeSpinId);
    if (!row) {
      throw new NotFoundException('Prize spin not found');
    }

    return {
      id: row.id,
      accountId: row.accountId,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
    };
  }

  async listPrizeSpins(
    accountId: number,
    callerUserId: number,
    archived?: string,
    page?: string,
    limit?: string,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    const filter = archived ?? 'false';
    if (filter !== 'false' && filter !== 'true' && filter !== 'all') {
      throw new BadRequestException('Invalid archived filter');
    }

    const pageNumber = page === undefined ? 1 : Number.parseInt(page, 10);
    const limitNumber = limit === undefined ? 10 : Number.parseInt(limit, 10);

    if (!Number.isFinite(pageNumber) || pageNumber < 1) {
      throw new BadRequestException('Invalid page');
    }

    if (!Number.isFinite(limitNumber) || limitNumber < 1 || limitNumber > 50) {
      throw new BadRequestException('Invalid limit');
    }

    const result = await this.database.listPrizeSpins(
      accountId,
      filter as 'false' | 'true' | 'all',
      pageNumber,
      limitNumber,
    );

    return {
      records: result.records.map((row) => this.formatPrizeSpinRecord(row)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async createPrizeSpin(
    accountId: number,
    callerUserId: number,
    title: string,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    try {
      const row = await this.database.createPrizeSpin(
        accountId,
        callerUserId,
        title,
      );
      return this.formatPrizeSpinRecord(row);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_TITLE') {
        throw new BadRequestException('Title must be 1-200 characters');
      }
      throw error;
    }
  }

  private formatPrizeSpinRecord(row: {
    id: number;
    accountId: number;
    title: string;
    status: PrizeSpinStatus;
    createdAt: Date;
    createdByUserId: number;
    createdByName: string;
  }) {
    return {
      id: row.id,
      accountId: row.accountId,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
    };
  }

  async goLivePrizeSpin(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    try {
      const row = await this.database.goLivePrizeSpin(accountId, prizeSpinId);
      return this.formatPrizeSpinRecord(row);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      throw error;
    }
  }

  async deactivatePrizeSpin(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    try {
      const row = await this.database.deactivatePrizeSpin(accountId, prizeSpinId);
      return this.formatPrizeSpinRecord(row);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      throw error;
    }
  }

  async archivePrizeSpin(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
  ) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }

    try {
      await this.database.archivePrizeSpin(accountId, prizeSpinId);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      throw error;
    }
  }

  async listPrizeSpinSectors(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const rows = await this.database.listPrizeSpinSectors(
        accountId,
        prizeSpinId,
      );
      return { sectors: rows.map((row) => this.formatPrizeSpinSector(row)) };
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      throw error;
    }
  }

  async createPrizeSpinSector(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
    label: string,
    winPercent: string,
    color?: string,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.createPrizeSpinSector(
        accountId,
        prizeSpinId,
        label,
        winPercent,
        color,
      );
      return this.formatPrizeSpinSector(row);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      this.mapPrizeSpinMutationError(error);
    }
  }

  async patchPrizeSpinSector(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
    sectorId: number,
    body: {
      label?: string;
      win_percent?: string | number;
      color?: string | null;
    },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const input: PatchPrizeSpinSectorInput = {};
    if (body.label !== undefined) {
      input.label = body.label;
    }
    if (body.win_percent !== undefined) {
      input.winPercent =
        typeof body.win_percent === 'number'
          ? body.win_percent.toString()
          : body.win_percent;
    }
    if (body.color !== undefined) {
      input.color = body.color;
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    try {
      const row = await this.database.patchPrizeSpinSector(
        accountId,
        prizeSpinId,
        sectorId,
        input,
      );
      return this.formatPrizeSpinSector(row);
    } catch (error) {
      this.mapPrizeSpinMutationError(error);
    }
  }

  async archivePrizeSpinSector(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
    sectorId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archivePrizeSpinSector(
        accountId,
        prizeSpinId,
        sectorId,
      );
    } catch (error) {
      this.mapPrizeSpinMutationError(error);
    }
  }

  async distributePrizeSpinSectorsEqually(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const rows = await this.database.distributePrizeSpinSectorsEqually(
        accountId,
        prizeSpinId,
      );
      return { sectors: rows.map((row) => this.formatPrizeSpinSector(row)) };
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      this.mapPrizeSpinMutationError(error);
    }
  }

  async listPrizeSpinWins(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const rows = await this.database.listPrizeSpinWins(accountId, prizeSpinId);
      return { wins: rows.map((row) => this.formatPrizeSpinWin(row)) };
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      throw error;
    }
  }

  async archivePrizeSpinWin(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
    winId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archivePrizeSpinWin(accountId, prizeSpinId, winId);
    } catch (error) {
      this.mapPrizeSpinMutationError(error);
    }
  }

  async archiveAllPrizeSpinWins(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archiveAllPrizeSpinWins(accountId, prizeSpinId);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      throw error;
    }
  }

  async spinPrizeSpin(
    accountId: number,
    callerUserId: number,
    prizeSpinId: number,
    participantNick: string,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.spinPrizeSpin(
        accountId,
        prizeSpinId,
        callerUserId,
        participantNick,
      );
      return this.formatPrizeSpinWin(row);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Prize spin not found');
      }
      this.mapPrizeSpinMutationError(error);
    }
  }
}

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
  type DbBonusBuyWidgetStylePreset,
  type DbMembership,
  type PatchBonusBuySlotInput,
  type PatchBonusBuyWidgetInput,
  type PatchPrizeSpinSectorInput,
  type DbPrizeSpinSector,
  type DbPrizeSpinWin,
  type DbPrizeSpinWidget,
  type DbChatRoll,
  type DbChatRollParticipant,
  type DbChatRollWin,
  type DbChatRollWidget,
  type PatchChatRollInput,
  type PrizeSpinStatus,
} from '../database/database.service.js';
import { KickEventsService } from '../kick-chat/kick-events.service.js';
import { parseBonusBuyWidgetStyleSettings } from '../bonus-buy/bonus-buy-widget-style.js';
import { KickChannelService } from './kick-channel.service.js';
import type { KickChannelDto } from './kick-channel.types.js';
import { KickOAuthService } from './kick-oauth.service.js';
import type { CreateModeratorResult, KickProfile, SessionUser } from './auth.types.js';
import {
  buildEntitlementEnvelope,
  normalizePlanTier,
  type EntitlementComplianceScope,
  type EntitlementEnvelope,
} from '../subscriptions/plan-entitlements.js';

type EntitlementRequestContext = {
  bonusBuyId?: number;
  prizeSpinId?: number;
  complianceScope?: EntitlementComplianceScope;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly kickOAuth: KickOAuthService,
    private readonly kickChannel: KickChannelService,
    private readonly kickEvents: KickEventsService,
  ) {}

  private async entitlementEnvelopeForAccount(
    accountId: number,
    context: EntitlementRequestContext = {},
  ): Promise<EntitlementEnvelope | null> {
    const subscription =
      await this.database.loadAccountSubscriptionSnapshot(accountId);
    if (!subscription.hasAccess) {
      return null;
    }
    const planTier = normalizePlanTier(subscription.planTier);
    const usage = await this.database.loadEntitlementUsage(accountId, context);
    const scope = context.complianceScope ?? { kind: 'account' as const };
    return buildEntitlementEnvelope(planTier, usage, scope);
  }

  private async withEntitlementEnvelope<T extends Record<string, unknown>>(
    accountId: number,
    payload: T,
    context?: EntitlementRequestContext,
  ): Promise<T & Partial<EntitlementEnvelope>> {
    const envelope = await this.entitlementEnvelopeForAccount(
      accountId,
      context ?? {},
    );
    return envelope ? { ...payload, ...envelope } : payload;
  }

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
      accountUcid: membership.ucid,
      accountName: membership.name,
      role: membership.role,
      subscriptionPlan: membership.subscriptionPlan,
      subscription: membership.subscription,
      channelSlug,
    };
  }

  private async resolveChannelSlug(accountId: number): Promise<string | undefined> {
    const channel = await this.database.getPrimaryKickChannel(accountId);
    return channel?.channelSlug;
  }

  async refreshSessionSubscription(user: SessionUser): Promise<SessionUser> {
    if (!user.accountId) {
      return user;
    }

    const membership = await this.database.getPrimaryMembership(user.id);
    if (!membership || membership.accountId !== user.accountId) {
      const subscription = await this.database.loadAccountSubscriptionSnapshot(
        user.accountId,
      );
      return { ...user, subscription };
    }

    return {
      ...user,
      subscriptionPlan: membership.subscriptionPlan,
      subscription: membership.subscription,
    };
  }

  async enrichSessionUser(user: SessionUser): Promise<SessionUser> {
    if (!user.accountId) {
      return user;
    }

    const channelSlug =
      user.channelSlug ?? (await this.resolveChannelSlug(user.accountId));
    const accountUcid =
      user.accountUcid ??
      (await this.database.getAccountUcid(user.accountId)) ??
      undefined;

    if (
      channelSlug === user.channelSlug &&
      accountUcid === user.accountUcid
    ) {
      return user;
    }

    return {
      ...user,
      ...(accountUcid ? { accountUcid } : {}),
      ...(channelSlug ? { channelSlug } : {}),
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

    return this.withEntitlementEnvelope(accountId, this.formatBonusBuy(row), {
      bonusBuyId,
      complianceScope: { kind: 'module', module: 'bonusBuy' },
    });
  }

  async listBonusBuys(
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

    const result = await this.database.listBonusBuys(
      accountId,
      filter as 'false' | 'true' | 'all',
      pageNumber,
      limitNumber,
    );

    return this.withEntitlementEnvelope(accountId, {
      records: result.records.map((row) => this.formatBonusBuy(row)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }, {
      complianceScope: { kind: 'module', module: 'bonusBuy' },
    });
  }

  async createBonusBuy(
    accountId: number,
    callerUserId: number,
    name: string,
    startBalance: string,
    currencyCode: string,
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
        name,
        startBalance,
        currencyCode,
      );
      return this.formatBonusBuy(row);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_NAME') {
          throw new BadRequestException('Name must be 1-200 characters');
        }
        if (error.message === 'INVALID_START_BALANCE') {
          throw new BadRequestException(
            'Start balance must be zero or a positive number with up to 2 decimal places',
          );
        }
        if (error.message === 'INVALID_CURRENCY_CODE') {
          throw new BadRequestException('Currency must be a valid ISO 4217 code');
        }
      }
      throw error;
    }
  }

  async goLiveBonusBuy(
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
      const row = await this.database.goLiveBonusBuy(accountId, bonusBuyId);
      return this.formatBonusBuy(row);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException('Bonus buy not found');
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
        name: row.name,
        startBalance: row.startBalance,
        status: row.status,
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
      name: row.name,
      startBalance: row.startBalance,
      currencyCode: row.currencyCode,
      status: row.status,
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
      name: row.name,
      providerName: row.providerName,
      purchaseAmount: row.purchaseAmount,
      winAmount: row.winAmount,
      multiplier: row.multiplier,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private formatBonusBuyWidget(row: DbBonusBuyWidget) {
    return {
      id: row.id,
      accountId: row.accountId,
      presetId: row.presetId,
      width: row.width,
      height: row.height,
      styleSettings: row.styleSettings,
      backgroundColor: row.styleSettings.backgroundColor,
      surfaceColor: row.styleSettings.surfaceColor,
      borderColor: row.styleSettings.borderColor,
      accentColor: row.styleSettings.accentColor,
      positiveColor: row.styleSettings.positiveColor,
      negativeColor: row.styleSettings.negativeColor,
      liveColor: row.styleSettings.liveColor,
      textMutedColor: row.styleSettings.textMutedColor,
      borderRadius: row.styleSettings.borderRadius,
      padding: row.styleSettings.padding,
      fontFamily: row.styleSettings.fontFamily,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private formatBonusBuyWidgetPreset(row: DbBonusBuyWidgetStylePreset) {
    return {
      id: row.id,
      accountId: row.accountId,
      createdByUserId: row.createdByUserId,
      source: row.source,
      name: row.source === 'user' ? 'Custom' : row.name,
      styleSettings: row.styleSettings,
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
      if (error.message === 'INVALID_WIDGET_STYLE') {
        throw new BadRequestException('Widget style settings are invalid');
      }
      if (error.message === 'PRESET_NOT_FOUND') {
        throw new BadRequestException('Widget preset not found');
      }
      if (error.message === 'PRESET_ID_REQUIRED') {
        throw new BadRequestException('preset_id is required when applying a theme');
      }
    }
    throw error;
  }

  private mapWidgetPresetMutationError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundException('Widget preset not found');
      }
      if (error.message === 'INVALID_PRESET_NAME') {
        throw new BadRequestException('Preset name must be 1-100 characters');
      }
      if (error.message === 'INVALID_WIDGET_STYLE') {
        throw new BadRequestException('Widget style settings are invalid');
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

    const hasAccess = await this.database.accountHasSubscriptionAccess(accountId);
    if (!hasAccess) {
      throw new ForbiddenException({
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'Account subscription has expired',
      });
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
    updates: {
      name?: string;
      start_balance?: string;
      currency_code?: string;
    },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    if (
      updates.name === undefined &&
      updates.start_balance === undefined &&
      updates.currency_code === undefined
    ) {
      throw new BadRequestException('At least one field is required');
    }

    try {
      const row = await this.database.updateBonusBuy(accountId, bonusBuyId, {
        name: updates.name,
        startBalance: updates.start_balance,
        currencyCode: updates.currency_code,
      });
      return this.formatBonusBuy(row);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          throw new NotFoundException('Bonus buy not found');
        }
        if (error.message === 'INVALID_NAME') {
          throw new BadRequestException('Name must be 1-200 characters');
        }
        if (error.message === 'INVALID_AMOUNT') {
          throw new BadRequestException(
            'Start balance must be zero or greater with up to 2 decimal places',
          );
        }
        if (error.message === 'INVALID_CURRENCY_CODE') {
          throw new BadRequestException('Currency must be a valid ISO 4217 code');
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
    name: string,
    providerName: string | undefined,
    purchaseAmount: string,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.createBonusBuySlot(
        accountId,
        bonusBuyId,
        callerUserId,
        name,
        providerName ?? null,
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
      name?: string;
      provider_name?: string | null;
      purchase_amount?: string;
      win_amount?: string | null;
      status?: 'pending' | 'playing' | 'archived';
    },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const input: PatchBonusBuySlotInput = {};
    if (body.name !== undefined) {
      input.name = body.name;
    }
    if (body.provider_name !== undefined) {
      input.providerName = body.provider_name;
    }
    if (body.purchase_amount !== undefined) {
      input.purchaseAmount = body.purchase_amount;
    }
    if (body.win_amount !== undefined) {
      input.winAmount = body.win_amount;
    }
    if (body.status !== undefined) {
      input.status = body.status;
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
      preset_id?: number | null;
    },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const hasStyleField =
      body.background_color !== undefined ||
      body.surface_color !== undefined ||
      body.border_color !== undefined ||
      body.accent_color !== undefined ||
      body.positive_color !== undefined ||
      body.negative_color !== undefined ||
      body.live_color !== undefined ||
      body.text_muted_color !== undefined ||
      body.border_radius !== undefined ||
      body.padding !== undefined ||
      body.font_family !== undefined;

    if (hasStyleField) {
      throw new BadRequestException(
        'Widget style fields must be saved via presets',
      );
    }

    if (body.preset_id === null) {
      throw new BadRequestException('preset_id is required when applying a theme');
    }

    const input: PatchBonusBuyWidgetInput = {
      width: body.width,
      height: body.height,
      presetId: body.preset_id,
    };

    const defined = Object.entries(input).filter(
      ([, value]) => value !== undefined,
    );
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

  async listBonusBuyWidgetPresets(accountId: number, callerUserId: number) {
    await this.requireAccountMember(accountId, callerUserId);
    const rows = await this.database.listBonusBuyWidgetPresets(accountId);
    return rows.map((row) => this.formatBonusBuyWidgetPreset(row));
  }

  async upsertBonusBuyWidgetCustomPreset(
    accountId: number,
    callerUserId: number,
    body: { style_settings?: unknown },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    if (body.style_settings === undefined) {
      throw new BadRequestException('Style settings are required');
    }

    try {
      const row = await this.database.upsertBonusBuyWidgetCustomPreset(
        accountId,
        callerUserId,
        {
          styleSettings: parseBonusBuyWidgetStyleSettings(body.style_settings),
        },
      );
      return this.formatBonusBuyWidgetPreset(row);
    } catch (error) {
      this.mapWidgetPresetMutationError(error);
    }
  }

  async deleteBonusBuyWidgetCustomPreset(
    accountId: number,
    callerUserId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.deleteBonusBuyWidgetCustomPreset(accountId);
    } catch (error) {
      this.mapWidgetPresetMutationError(error);
    }
  }

  async getPublicBonusBuyWidgetByUcid(ucid: string) {
    const accountId = await this.database.getAccountIdByUcid(ucid);
    if (accountId === null) {
      throw new NotFoundException({
        status: 'not_found',
        reason: 'unknown_account',
      });
    }

    const hasAccess = await this.database.accountHasSubscriptionAccess(accountId);
    if (!hasAccess) {
      return {
        status: 'unavailable' as const,
        reason: 'subscription_expired' as const,
      };
    }

    const view = await this.database.getPublicBonusBuyWidgetViewByUcid(ucid);
    if (view.kind === 'not_found') {
      throw new NotFoundException({
        status: 'not_found',
        reason: 'unknown_account',
      });
    }

    if (view.kind === 'unavailable') {
      return {
        status: 'unavailable' as const,
        reason: view.reason,
      };
    }

    const blockReason = await this.widgetBlockReason(accountId, {
      bonusBuyId: view.record.id,
    });
    if (blockReason === 'entitlement_over_limit') {
      return {
        status: 'unavailable' as const,
        reason: 'entitlement_over_limit' as const,
      };
    }

    return {
      status: 'active' as const,
      record: {
        id: view.record.id,
        name: view.record.name,
        startBalance: view.record.startBalance,
        currencyCode: view.record.currencyCode,
        status: view.record.status,
      },
      slots: view.slots.map((row) => this.formatBonusBuySlot(row)),
      settings: this.formatBonusBuyWidget(view.settings),
    };
  }

  async getPublicChatRollWidgetByUcid(ucid: string) {
    const accountId = await this.database.getAccountIdByUcid(ucid);
    if (accountId === null) {
      throw new NotFoundException({
        status: 'not_found',
        reason: 'unknown_account',
      });
    }

    const hasAccess = await this.database.accountHasSubscriptionAccess(accountId);
    if (!hasAccess) {
      return {
        status: 'unavailable' as const,
        reason: 'subscription_expired' as const,
      };
    }

    const view = await this.database.getPublicChatRollWidgetViewByUcid(ucid);
    if (view.kind === 'not_found') {
      throw new NotFoundException({
        status: 'not_found',
        reason: 'unknown_account',
      });
    }

    if (view.kind === 'unavailable') {
      return {
        status: 'unavailable' as const,
        reason: view.reason,
      };
    }

    const blockReason = await this.widgetBlockReason(accountId);
    if (blockReason === 'entitlement_over_limit') {
      return {
        status: 'unavailable' as const,
        reason: 'entitlement_over_limit' as const,
      };
    }

    return {
      status: 'active' as const,
      record: {
        id: view.record.id,
        keyword: view.record.keyword,
        widgetKeywordPrefix: view.record.widgetKeywordPrefix,
        status: view.record.status,
      },
    };
  }

  async getPublicPrizeSpinWidgetByUcid(ucid: string) {
    const accountId = await this.database.getAccountIdByUcid(ucid);
    if (accountId === null) {
      throw new NotFoundException({
        status: 'not_found',
        reason: 'unknown_account',
      });
    }

    const hasAccess = await this.database.accountHasSubscriptionAccess(accountId);
    if (!hasAccess) {
      return {
        status: 'unavailable' as const,
        reason: 'subscription_expired' as const,
      };
    }

    const view = await this.database.getPublicPrizeSpinWidgetViewByUcid(ucid);
    if (view.kind === 'not_found') {
      throw new NotFoundException({
        status: 'not_found',
        reason: 'unknown_account',
      });
    }

    if (view.kind === 'unavailable') {
      return {
        status: 'unavailable' as const,
        reason: view.reason,
      };
    }

    const blockReason = await this.widgetBlockReason(accountId, {
      prizeSpinId: view.record.id,
    });
    if (blockReason === 'entitlement_over_limit') {
      return {
        status: 'unavailable' as const,
        reason: 'entitlement_over_limit' as const,
      };
    }

    return {
      status: 'active' as const,
      ...this.formatPublicPrizeSpinWidgetView({
        record: view.record,
        sectors: view.sectors,
        latestWin: view.latestWin,
        settings: view.settings,
      }),
    };
  }

  private formatPrizeSpinWidget(row: DbPrizeSpinWidget) {
    return {
      id: row.id,
      accountId: row.accountId,
      width: row.width,
      height: row.height,
      equalSectorSlices: row.equalSectorSlices,
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
    body: { width?: number; height?: number; equalSectorSlices?: boolean },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const input = {
      width: body.width,
      height: body.height,
      equalSectorSlices: body.equalSectorSlices,
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
        equalSectorSlices: view.settings.equalSectorSlices,
      },
    };
  }

  async getPublicPrizeSpinWidgetById(prizeSpinId: number) {
    const view =
      await this.database.getPublicPrizeSpinWidgetViewForPublic(prizeSpinId);

    if (view === 'NOT_FOUND') {
      throw new NotFoundException('Prize spin not found');
    }

    return this.formatPublicPrizeSpinWidgetView(view);
  }

  private async widgetBlockReason(
    accountId: number,
    context: { bonusBuyId?: number; prizeSpinId?: number } = {},
  ): Promise<'subscription_expired' | 'entitlement_over_limit' | null> {
    const hasAccess = await this.database.accountHasSubscriptionAccess(accountId);
    if (!hasAccess) {
      return 'subscription_expired';
    }
    const envelope = await this.entitlementEnvelopeForAccount(accountId, {
      ...context,
      complianceScope: { kind: 'account' },
    });
    if (envelope?.compliance === 'over_limit') {
      return 'entitlement_over_limit';
    }
    return null;
  }

  async getAccountMembers(accountId: number, callerUserId: number) {
    await this.requireAccountMember(accountId, callerUserId);
    const members = await this.database.listAccountMembers(accountId);
    return this.withEntitlementEnvelope(accountId, { members }, {
      complianceScope: { kind: 'team' },
    });
  }

  async getKickChannel(
    accountId: number,
    callerUserId: number,
  ): Promise<KickChannelDto> {
    await this.requireAccountMember(accountId, callerUserId);
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

    return this.withEntitlementEnvelope(accountId, {
      id: row.id,
      accountId: row.accountId,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
    }, {
      prizeSpinId,
      complianceScope: { kind: 'module', module: 'prizeSpin' },
    });
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

    return this.withEntitlementEnvelope(accountId, {
      records: result.records.map((row) => this.formatPrizeSpinRecord(row)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }, {
      complianceScope: { kind: 'module', module: 'prizeSpin' },
    });
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

  async copyPrizeSpin(
    accountId: number,
    callerUserId: number,
    sourcePrizeSpinId: number,
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
      const row = await this.database.copyPrizeSpin(
        accountId,
        sourcePrizeSpinId,
        callerUserId,
        title,
      );
      return this.formatPrizeSpinRecord(row);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_TITLE') {
        throw new BadRequestException('Title must be 1-200 characters');
      }
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

  private formatChatRollRecord(row: DbChatRoll) {
    return {
      id: row.id,
      accountId: row.accountId,
      title: row.title,
      status: row.status,
      keyword: row.keyword,
      widgetKeywordPrefix: row.widgetKeywordPrefix,
      combineMode: row.combineMode,
      excludeWinnerAfterRoll: row.excludeWinnerAfterRoll,
      isAcceptingParticipants: row.isAcceptingParticipants,
      replyInChat: row.replyInChat,
      winnerResponseEnabled: row.winnerResponseEnabled,
      winnerResponseSeconds: row.winnerResponseSeconds,
      roleSettings: row.roleSettings,
      createdAt: row.createdAt.toISOString(),
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
    };
  }

  private formatChatRollParticipant(row: DbChatRollParticipant) {
    return {
      id: row.id,
      chatRollId: row.chatRollId,
      provider: row.provider,
      providerUserId: row.providerUserId,
      displayName: row.displayName,
      roleIds: row.roleIds,
      joinedAt: row.joinedAt.toISOString(),
    };
  }

  private formatChatRollWin(row: DbChatRollWin) {
    return {
      id: row.id,
      chatRollId: row.chatRollId,
      participantId: row.participantId,
      displayName: row.displayName,
      coefficientAtPick: row.coefficientAtPick,
      rolledByName: row.rolledByName,
      rollIndex: row.rollIndex,
      responseStatus: row.responseStatus,
      responseDeadlineAt: row.responseDeadlineAt?.toISOString() ?? null,
      respondedAt: row.respondedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private formatChatRollWidget(row: DbChatRollWidget) {
    return {
      id: row.id,
      accountId: row.accountId,
      width: row.width,
      height: row.height,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapChatRollMutationError(error: unknown): never {
    if (error instanceof Error) {
      switch (error.message) {
        case 'NOT_FOUND':
          throw new NotFoundException('Chat roll not found');
        case 'INVALID_TITLE':
          throw new BadRequestException('Title must be 1-200 characters');
        case 'INVALID_KEYWORD':
          throw new BadRequestException('Keyword must be 1-32 characters');
        case 'INVALID_WIDGET_KEYWORD_PREFIX':
          throw new BadRequestException(
            'Widget label must be 1-120 characters',
          );
        case 'INVALID_COMBINE_MODE':
          throw new BadRequestException('Invalid combine mode');
        case 'INVALID_ROLE_SETTINGS':
          throw new BadRequestException('Invalid role settings');
        case 'INVALID_WINNER_RESPONSE_SECONDS':
          throw new BadRequestException(
            'Response time must be between 5 and 300 seconds',
          );
        case 'NO_ELIGIBLE_PARTICIPANTS':
          throw new BadRequestException('No eligible participants to roll');
        case 'NOT_LIVE':
          throw new BadRequestException('Session is not live');
        default:
          break;
      }
    }
    throw error;
  }

  private mapChatRollWidgetMutationError(error: unknown): never {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      throw new NotFoundException('Chat roll widget settings not found');
    }
    throw error;
  }

  async getChatRoll(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const row = await this.database.getChatRollById(accountId, chatRollId);
    if (!row) {
      throw new NotFoundException('Chat roll not found');
    }

    return this.withEntitlementEnvelope(accountId, this.formatChatRollRecord(row), {
      complianceScope: { kind: 'module', module: 'chatRoll' },
    });
  }

  async listChatRolls(
    accountId: number,
    callerUserId: number,
    archived?: string,
    page?: string,
    limit?: string,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

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

    const result = await this.database.listChatRolls(
      accountId,
      filter as 'false' | 'true' | 'all',
      pageNumber,
      limitNumber,
    );

    return this.withEntitlementEnvelope(accountId, {
      records: result.records.map((row) => this.formatChatRollRecord(row)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }, {
      complianceScope: { kind: 'module', module: 'chatRoll' },
    });
  }

  async createChatRoll(
    accountId: number,
    callerUserId: number,
    title: string,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.createChatRoll(
        accountId,
        callerUserId,
        title,
      );
      return this.formatChatRollRecord(row);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async archiveChatRoll(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archiveChatRoll(accountId, chatRollId);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async goLiveChatRoll(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.goLiveChatRoll(accountId, chatRollId);
      return this.formatChatRollRecord(row);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async deactivateChatRoll(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.deactivateChatRoll(accountId, chatRollId);
      return this.formatChatRollRecord(row);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async patchChatRoll(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
    body: {
      title?: string;
      keyword?: string;
      widget_keyword_prefix?: string;
      combine_mode?: string;
      exclude_winner_after_roll?: boolean;
      is_accepting_participants?: boolean;
      reply_in_chat?: boolean;
      winner_response_enabled?: boolean;
      winner_response_seconds?: number;
      role_settings?: unknown;
    },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    const input: PatchChatRollInput = {};
    if (body.title !== undefined) {
      input.title = body.title;
    }
    if (body.keyword !== undefined) {
      input.keyword = body.keyword;
    }
    if (body.widget_keyword_prefix !== undefined) {
      input.widgetKeywordPrefix = body.widget_keyword_prefix;
    }
    if (body.combine_mode !== undefined) {
      if (body.combine_mode !== 'highest' && body.combine_mode !== 'sum') {
        throw new BadRequestException('Invalid combine mode');
      }
      input.combineMode = body.combine_mode;
    }
    if (body.exclude_winner_after_roll !== undefined) {
      input.excludeWinnerAfterRoll = body.exclude_winner_after_roll;
    }
    if (body.is_accepting_participants !== undefined) {
      input.isAcceptingParticipants = body.is_accepting_participants;
    }
    if (body.reply_in_chat !== undefined) {
      input.replyInChat = body.reply_in_chat;
    }
    if (body.winner_response_enabled !== undefined) {
      input.winnerResponseEnabled = body.winner_response_enabled;
    }
    if (body.winner_response_seconds !== undefined) {
      input.winnerResponseSeconds = body.winner_response_seconds;
    }
    if (body.role_settings !== undefined) {
      input.roleSettings = body.role_settings as PatchChatRollInput['roleSettings'];
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    try {
      const row = await this.database.patchChatRoll(
        accountId,
        chatRollId,
        input,
      );
      return this.formatChatRollRecord(row);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async listChatRollParticipants(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const rows = await this.database.listChatRollParticipants(
        accountId,
        chatRollId,
      );
      return {
        participants: rows.map((row) => this.formatChatRollParticipant(row)),
      };
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async archiveChatRollParticipant(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
    participantId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archiveChatRollParticipant(
        accountId,
        chatRollId,
        participantId,
      );
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async archiveAllChatRollParticipants(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archiveAllChatRollParticipants(accountId, chatRollId);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async listChatRollWins(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const rows = await this.database.listChatRollWins(accountId, chatRollId);
      return {
        wins: rows.map((row) => this.formatChatRollWin(row)),
      };
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async archiveChatRollWin(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
    winId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archiveChatRollWin(accountId, chatRollId, winId);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async archiveAllChatRollWins(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      await this.database.archiveAllChatRollWins(accountId, chatRollId);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async rollChatRoll(
    accountId: number,
    callerUserId: number,
    chatRollId: number,
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.rollChatRoll(
        accountId,
        chatRollId,
        callerUserId,
      );
      return this.formatChatRollWin(row);
    } catch (error) {
      this.mapChatRollMutationError(error);
    }
  }

  async getChatRollWidget(accountId: number, callerUserId: number) {
    await this.requireAccountMember(accountId, callerUserId);

    try {
      const row = await this.database.getChatRollWidget(accountId);
      return this.formatChatRollWidget(row);
    } catch (error) {
      this.mapChatRollWidgetMutationError(error);
    }
  }

  async patchChatRollWidget(
    accountId: number,
    callerUserId: number,
    body: { width?: number; height?: number },
  ) {
    await this.requireAccountMember(accountId, callerUserId);

    if (body.width === undefined && body.height === undefined) {
      throw new BadRequestException('No fields to update');
    }

    try {
      const row = await this.database.patchChatRollWidget(accountId, body);
      return this.formatChatRollWidget(row);
    } catch (error) {
      this.mapChatRollWidgetMutationError(error);
    }
  }
}

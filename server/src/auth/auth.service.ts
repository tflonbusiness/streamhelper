import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DatabaseService,
  type DbBonusBuy,
  type DbBonusBuySlot,
  type PatchBonusBuySlotInput,
} from '../database/database.service.js';
import { KickChannelService } from './kick-channel.service.js';
import type { KickChannelDto } from './kick-channel.types.js';
import { KickOAuthService } from './kick-oauth.service.js';
import type { CreateAdminResult, KickProfile, SessionUser } from './auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly kickOAuth: KickOAuthService,
    private readonly kickChannel: KickChannelService,
  ) {}

  getAppBaseUrl(): string {
    return process.env.APP_URL ?? 'http://localhost:5173';
  }

  buildSessionUser(
    id: number,
    name: string,
    membership?: {
      accountId: number;
      name: string;
      role: 'owner' | 'admin';
      subscriptionPlan: string;
    },
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

    return this.buildSessionUser(user.id, user.name, membership);
  }

  async handleKickCallback(
    code: string,
    codeVerifier?: string,
  ): Promise<SessionUser> {
    const profile = await this.kickOAuth.exchangeCodeForProfile(
      code,
      codeVerifier,
    );
    const { userId, membership } =
      await this.database.provisionOwnerFromKick(profile);

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

    return this.buildSessionUser(user.id, user.name, membership);
  }

  async handleJoinToken(token: string): Promise<SessionUser> {
    const userId = await this.database.findAccessLinkUserIdByToken(token);
    if (!userId) {
      throw new UnauthorizedException('Invalid or revoked link');
    }

    return this.establishSessionForUserId(userId);
  }

  async createAdmin(
    accountId: number,
    ownerUserId: number,
    name: string,
  ): Promise<CreateAdminResult> {
    try {
      const result = await this.database.createAdminWithAccessLink(
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
          throw new ForbiddenException('Only account owner can create admins');
        }
        if (error.message === 'INVALID_ADMIN_NAME') {
          throw new BadRequestException('Name must be 2-100 characters');
        }
      }
      throw error;
    }
  }

  async revokeAdmin(
    accountId: number,
    ownerUserId: number,
    adminUserId: number,
  ): Promise<void> {
    try {
      await this.database.revokeAdminPermanently(
        accountId,
        ownerUserId,
        adminUserId,
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'FORBIDDEN') {
          throw new ForbiddenException('Only account owner can revoke admins');
        }
        if (error.message === 'ADMIN_NOT_FOUND') {
          throw new NotFoundException('Admin not found');
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

  private async requireAccountMember(accountId: number, callerUserId: number) {
    const isMember = await this.database.hasActiveMembership(
      accountId,
      callerUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('Not a member of this account');
    }
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

  async getAdminInviteLink(
    accountId: number,
    ownerUserId: number,
    adminUserId: number,
  ): Promise<{ joinUrl: string }> {
    try {
      return await this.database.rotateAdminInviteLink(
        accountId,
        ownerUserId,
        adminUserId,
        this.getAppBaseUrl(),
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'FORBIDDEN') {
          throw new ForbiddenException('Only account owner can copy invite links');
        }
        if (error.message === 'ADMIN_NOT_FOUND') {
          throw new NotFoundException('Admin not found');
        }
        if (error.message === 'INVITE_LINK_NOT_FOUND') {
          throw new NotFoundException('Invite link not available for this admin');
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
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
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

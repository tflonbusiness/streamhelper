import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { DatabaseService } from '../database/database.service.js';
import { KickChannelService } from './kick-channel.service.js';
import { KickOAuthService } from './kick-oauth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let hasActiveCredentials: ReturnType<typeof vi.fn>;
  let findUserById: ReturnType<typeof vi.fn>;
  let getPrimaryMembership: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    hasActiveCredentials = vi.fn();
    findUserById = vi.fn();
    getPrimaryMembership = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {
            hasActiveCredentials,
            findUserById,
            getPrimaryMembership,
            provisionOwnerFromKick: vi.fn(),
            findCredentialByProvider: vi.fn(),
            findAccessLinkUserIdByToken: vi.fn(),
            createModeratorWithAccessLink: vi.fn(),
            revokeModeratorPermanently: vi.fn(),
            listAccountMembers: vi.fn(),
            hasActiveMembership: vi.fn(),
          },
        },
        {
          provide: KickOAuthService,
          useValue: {
            exchangeCodeForProfile: vi.fn(),
          },
        },
        {
          provide: KickChannelService,
          useValue: {
            getChannelForAccount: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('establishSessionForUserId returns user with account context', async () => {
    hasActiveCredentials.mockResolvedValue(true);
    findUserById.mockResolvedValue({ id: 1, name: 'demo_streamer' });
    getPrimaryMembership.mockResolvedValue({
      accountId: 10,
      ucid: '550e8400-e29b-41d4-a716-446655440000',
      name: 'demo_streamer',
      role: 'owner',
      subscriptionPlan: 'free',
    });

    await expect(service.establishSessionForUserId(1)).resolves.toEqual({
      id: 1,
      name: 'demo_streamer',
      accountId: 10,
      accountName: 'demo_streamer',
      role: 'owner',
      subscriptionPlan: 'free',
      ucid: '550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('establishSessionForUserId rejects revoked credentials', async () => {
    hasActiveCredentials.mockResolvedValue(false);

    await expect(service.establishSessionForUserId(1)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

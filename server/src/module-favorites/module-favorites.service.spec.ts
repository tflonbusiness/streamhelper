import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModuleFavoritesService } from './module-favorites.service.js';
import type { DatabaseService } from '../database/database.service.js';

describe('ModuleFavoritesService', () => {
  const database = {
    getUserModuleFavorites: vi.fn(),
    upsertUserModuleFavorites: vi.fn(),
  } as unknown as DatabaseService;

  const service = new ModuleFavoritesService(database);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns defaults when user has no row', async () => {
    vi.mocked(database.getUserModuleFavorites).mockResolvedValue(null);

    await expect(service.getModuleFavorites(1)).resolves.toEqual({
      moduleIds: ['bonus-buy', 'prize-spin', 'chat-roll'],
    });
  });

  it('filters unknown ids from stored favorites', async () => {
    vi.mocked(database.getUserModuleFavorites).mockResolvedValue([
      'bonus-buy',
      'retired-module',
      'chat-roll',
    ]);

    await expect(service.getModuleFavorites(1)).resolves.toEqual({
      moduleIds: ['bonus-buy', 'chat-roll'],
    });
  });

  it('rejects invalid module ids on put', async () => {
    await expect(
      service.setModuleFavorites(1, ['bonus-buy', 'not-a-module']),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('persists validated favorites', async () => {
    vi.mocked(database.upsertUserModuleFavorites).mockResolvedValue(undefined);

    await expect(
      service.setModuleFavorites(1, ['first-reaction', 'bonus-buy']),
    ).resolves.toEqual({
      moduleIds: ['first-reaction', 'bonus-buy'],
    });

    expect(database.upsertUserModuleFavorites).toHaveBeenCalledWith(1, [
      'first-reaction',
      'bonus-buy',
    ]);
  });
});

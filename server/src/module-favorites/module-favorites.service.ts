import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import {
  DEFAULT_FAVORITE_MODULE_IDS,
  isFavoritableModuleId,
} from './module-catalog.js';

@Injectable()
export class ModuleFavoritesService {
  constructor(private readonly database: DatabaseService) {}

  async getModuleFavorites(userId: number): Promise<{ moduleIds: string[] }> {
    const stored = await this.database.getUserModuleFavorites(userId);
    const moduleIds =
      stored === null
        ? [...DEFAULT_FAVORITE_MODULE_IDS]
        : this.sanitizeStoredIds(stored);
    return { moduleIds };
  }

  async setModuleFavorites(
    userId: number,
    rawModuleIds: unknown,
  ): Promise<{ moduleIds: string[] }> {
    const moduleIds = this.parseAndValidateModuleIds(rawModuleIds);
    await this.database.upsertUserModuleFavorites(userId, moduleIds);
    return { moduleIds };
  }

  private parseAndValidateModuleIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) {
      throw new BadRequestException('moduleIds must be an array');
    }

    const seen = new Set<string>();
    const moduleIds: string[] = [];

    for (const entry of raw) {
      if (typeof entry !== 'string') {
        throw new BadRequestException('moduleIds must contain only strings');
      }
      if (!isFavoritableModuleId(entry)) {
        throw new BadRequestException(`Unknown module id: ${entry}`);
      }
      if (seen.has(entry)) {
        throw new BadRequestException('moduleIds must not contain duplicates');
      }
      seen.add(entry);
      moduleIds.push(entry);
    }

    return moduleIds;
  }

  private sanitizeStoredIds(stored: string[]): string[] {
    const seen = new Set<string>();
    const moduleIds: string[] = [];
    for (const entry of stored) {
      if (typeof entry !== 'string' || !isFavoritableModuleId(entry)) {
        continue;
      }
      if (seen.has(entry)) {
        continue;
      }
      seen.add(entry);
      moduleIds.push(entry);
    }
    return moduleIds;
  }
}

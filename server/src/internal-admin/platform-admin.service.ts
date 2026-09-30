import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class PlatformAdminService {
  constructor(private readonly database: DatabaseService) {}

  async isPlatformAdmin(userId: number): Promise<boolean> {
    return this.database.isPlatformAdmin(userId);
  }

  async requirePlatformAdmin(userId: number): Promise<void> {
    const allowed = await this.isPlatformAdmin(userId);
    if (!allowed) {
      throw new ForbiddenException('Platform admin access required');
    }
  }
}

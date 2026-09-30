import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import type { SessionData } from './auth.types.js';

@Controller('join')
export class JoinController {
  constructor(private readonly authService: AuthService) {}

  @Get(':token')
  async join(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const sessionUser = await this.authService.handleJoinToken(token);
      const session = req.session as SessionData;
      session.user = sessionUser;
      session.loginSurface = 'streamer';

      const appUrl = this.authService.getAppBaseUrl();
      res.redirect(`${appUrl}/dashboard`);
    } catch {
      const appUrl = this.authService.getAppBaseUrl();
      res.redirect(`${appUrl}/login?join_error=1`);
    }
  }
}

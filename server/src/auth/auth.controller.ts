import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { KickOAuthService } from './kick-oauth.service.js';
import type { SessionData } from './auth.types.js';

function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly kickOAuth: KickOAuthService,
  ) {}

  @Get('oauth/kick')
  async kickAuthorize(@Req() req: Request, @Res() res: Response) {
    const oauthRequest = this.kickOAuth.createOAuthRequest();
    const session = req.session as SessionData;

    session.kickOAuth = {
      state: oauthRequest.state,
      codeVerifier: oauthRequest.codeVerifier,
    };

    await saveSession(req);

    const url = this.kickOAuth.buildAuthorizeUrl(oauthRequest);
    console.log(`[Kick OAuth] authorize redirect → ${this.kickOAuth.describeAuthorizeTarget(oauthRequest)}`);
    res.redirect(url);
  }

  @Get('oauth/kick/callback')
  async kickCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') oauthError: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const appUrl = this.authService.getAppBaseUrl();

    if (oauthError) {
      res.redirect(`${appUrl}/?auth_error=1`);
      return;
    }

    if (!code) {
      res.redirect(`${appUrl}/?auth_error=1`);
      return;
    }

    const session = req.session as SessionData;
    let codeVerifier: string | undefined;

    if (!this.kickOAuth.isMockMode()) {
      if (
        !state ||
        !session.kickOAuth ||
        session.kickOAuth.state !== state
      ) {
        res.redirect(`${appUrl}/?auth_error=state`);
        return;
      }
      codeVerifier = session.kickOAuth.codeVerifier;
    } else if (session.kickOAuth) {
      codeVerifier = session.kickOAuth.codeVerifier;
    }

    delete session.kickOAuth;

    try {
      const sessionUser = await this.authService.handleKickCallback(
        code,
        codeVerifier,
      );
      session.user = sessionUser;
      await saveSession(req);
      res.redirect(`${appUrl}/dashboard`);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        res.redirect(`${appUrl}/?auth_error=1`);
        return;
      }
      throw error;
    }
  }

  @Get('me')
  async me(@Req() req: Request) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    const withSubscription =
      await this.authService.refreshSessionSubscription(user);
    return {
      user: await this.authService.enrichSessionUser(withSubscription),
    };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request) {
    return new Promise<{ ok: true }>((resolve, reject) => {
      req.session.destroy((error: Error | undefined) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ ok: true });
      });
    });
  }
}

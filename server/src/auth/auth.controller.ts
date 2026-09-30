import {
  Body,
  Controller,
  ForbiddenException,
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
import type { LoginSurface, SessionData } from './auth.types.js';
import { DatabaseService } from '../database/database.service.js';

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

function resolveLoginSurface(raw: string | undefined): LoginSurface {
  return raw === 'service' ? 'service' : 'streamer';
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly kickOAuth: KickOAuthService,
    private readonly database: DatabaseService,
  ) {}

  private loginErrorRedirect(appUrl: string): string {
    return `${appUrl}/login?auth_error=1`;
  }

  @Get('oauth/kick')
  async kickAuthorize(
    @Query('surface') surfaceQuery: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const oauthRequest = this.kickOAuth.createOAuthRequest();
    const session = req.session as SessionData;

    session.loginSurface = resolveLoginSurface(surfaceQuery);
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
    const session = req.session as SessionData;

    if (oauthError) {
      res.redirect(this.loginErrorRedirect(appUrl));
      return;
    }

    if (!code) {
      res.redirect(this.loginErrorRedirect(appUrl));
      return;
    }

    let codeVerifier: string | undefined;

    if (!this.kickOAuth.isMockMode()) {
      if (
        !state ||
        !session.kickOAuth ||
        session.kickOAuth.state !== state
      ) {
        res.redirect(`${appUrl}/login?auth_error=state`);
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
      session.loginSurface = 'streamer';
      await saveSession(req);

      const isAdmin = await this.database.isPlatformAdmin(sessionUser.id);
      if (isAdmin) {
        res.redirect(`${appUrl}/continue`);
        return;
      }

      res.redirect(`${appUrl}/dashboard`);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        res.redirect(this.loginErrorRedirect(appUrl));
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
    const enriched = await this.authService.enrichSessionUser(withSubscription);
    const platformAdmin = await this.database.isPlatformAdmin(enriched.id);
    return {
      user: { ...enriched, platformAdmin },
      loginSurface: session.loginSurface ?? 'streamer',
    };
  }

  @Post('surface')
  @HttpCode(200)
  async setSurface(
    @Req() req: Request,
    @Body() body: { surface?: string },
  ) {
    const session = req.session as SessionData;
    const user = await this.authService.requireValidSessionUser(session.user);
    const surface = resolveLoginSurface(body.surface);

    if (surface === 'service') {
      const isAdmin = await this.database.isPlatformAdmin(user.id);
      if (!isAdmin) {
        throw new ForbiddenException('Platform admin access required');
      }
    }

    session.loginSurface = surface;
    await saveSession(req);

    return { ok: true as const, loginSurface: surface };
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

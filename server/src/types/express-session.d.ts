import type { SessionData as AuthSessionData } from '../auth/auth.types.js';

declare module 'express-session' {
  interface SessionData extends AuthSessionData {}
}

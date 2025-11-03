import type { AccessTokenClaims } from './index.ts';

// extending the global Express interface to satisfy type checking
declare global {
  namespace Express {
    interface Request {
      accessTokenClaims?: AccessTokenClaims;
      accessToken?: string;
    }
  }
}

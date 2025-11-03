import type { JwtPayload } from "jsonwebtoken";

// todo: convert to prisma table
export type User = {
  id: string;
  email: string;
  hashedPassword: string;
  isAdmin: boolean;
  obsVaultMcpTokenLimit: number;
  obsVaultMcpTokensUsed: number;
};

// todo: convert to prisma table
// to log out (always logs out of all devices): increment refreshTokenVersion in UserRefreshToken row with userId == UserRefreshToken.userId
export type UserRefreshToken = {
  userId: string;
  refreshTokenVersion: number; // default 1
}

// ------------------

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/*
Jwt Token Terminology:

* "Claim": a key-value pair that represents a piece of information about the subject/user of that token

* Standard JWT claims used:

- iss: the issuer of the token (the url of this api gateway server)
- aud: the url of the intended recipient of the token (the url of SmartVaultClient)
- exp: the time the token expires
*/

type JWTTokenStandardClaims = Pick<JwtPayload, 'iss' | 'aud' | 'exp'>;

export type AccessTokenClaims = JWTTokenStandardClaims & {
  userId: string;
  email: string;
  isAdmin: boolean;
  obsVaultMcpTokenLimit: number;
};

export type RefreshTokenClaims = JWTTokenStandardClaims & {
  userId: string;
  refreshTokenVersion: number // for invalidating refresh tokens for all logged in devices for a specific user when the user logs out
};

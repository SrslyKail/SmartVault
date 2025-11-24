import type { JwtPayload } from "jsonwebtoken";
import type { User } from "../data/models/generated/prisma/client.ts";

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
  apiServiceCallLimit: number;
};

export type RefreshTokenClaims = JWTTokenStandardClaims & {
  userId: string;
  refreshTokenVersion: number // for invalidating refresh tokens for all logged in devices for a specific user when the user logs out
};

export type GetUserResponse = Omit<User, 'hashedPassword'>;

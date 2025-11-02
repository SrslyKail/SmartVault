export type User = {
  id: string;
  email: string;
  hashedPassword: string;
};

export type JWTPair = {
  accessToken: string;
  refreshToken: string;
};

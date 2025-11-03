// // __prod__ is a boolean that is true when the NODE_ENV is "production"
// const cookieOpts = {
//   httpOnly: true,
//   secure: __prod__,
//   sameSite: "lax",
//   path: "/",
//   domain: __prod__ ? `.${process.env.DOMAIN}` : "",
//   maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
// } as const;

export const ACCESS_TOKEN_COOKIE_KEY = "accessToken";
export const REFRESH_TOKEN_COOKIE_KEY = "refreshToken";

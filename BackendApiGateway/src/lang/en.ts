export const HTTP_ERRORS = {
  SERVER_ERROR:             "An internal server error occured",
  RESOURCE_NOT_FOUND_ERROR: "The requested resource was not found",
  UNAUTHORIZED_ERROR:       "Unauthorized"
};

export const AUTH_ERRORS = {
  EMPTY_EMAIL_ERROR: "Please enter an email",
  EMAIL_ALREADY_EXISTS_ERROR: "The email you have provided is already associated with an account",
  
  EMPTY_PASSWORD_ERROR: "Please enter a password",
  INCORRECT_PASSWORD_ERROR: "The entered password is incorrect",

  USER_NOT_FOUND_WITH_EMAIL_ERROR: "User not found with this email",
  USER_NOT_FOUND_WITH_ID_ERROR: "User not found with id",
  USER_NO_ASSOCIATED_REFRESH_TOKEN_INFO_ERROR: "User account is not associated with a piece of required login information. Please contact support",

  SESSION_EXPIRED_ERROR: "User session has expired",

  MISSING_AUTH_TOKENS_ERROR: "Unauthorized. Missing access or refresh token"
};

export const AUTH_MESSAGES = {
  SUCCESSFUL_LOGIN: "Successfully logged in",
  SUCCESSFUL_SIGNUP: "Successfully signed up",
  SUCCESSFUL_LOGOUT: "Successfully logged out"
}

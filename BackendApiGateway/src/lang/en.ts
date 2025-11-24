import { UserType } from "../data/models/generated/prisma/enums.ts";
import { APICallLimiter } from "../lib/apiCallLimit.ts";
import { AuthTokenService } from "../services/authToken.service.ts";
import { UserService } from "../services/user.service.ts";

export const HTTP_ERRORS = {
  SERVER_ERROR:             "An internal server error occured",
  RESOURCE_NOT_FOUND_ERROR: "The requested resource was not found",
  UNAUTHORIZED_ERROR:       "Unauthorized",
  FORBIDDEN_ERROR:          "You do not have the necessary permission to access this resource"
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

  MISSING_AUTH_TOKENS_ERROR: "Unauthorized. Missing access or refresh token",
};

export const AUTH_MESSAGES = {
  SUCCESSFUL_LOGIN: "Successfully logged in",
  SUCCESSFUL_SIGNUP: "Successfully signed up",
  SUCCESSFUL_LOGOUT: `Successfully logged out. Please wait ${AuthTokenService.ACCESS_TOKEN_EXPIRY_TIME_MINS} ${AuthTokenService.ACCESS_TOKEN_EXPIRY_TIME_UNITS} for this to take effect`
}

export const OBS_MCP_PROMPT_ERRORS = {
  EMPTY_PROMPT_ERROR: "Please enter a non-empty prompt",
};

export const API_SERVICE_USAGE_MESSAGES = {
  EXCEEDED_CALL_LIMIT_WARNING: "Warning: you have reached your service request limit. But you can continue using these services"
};

export const API_SERVICE_USAGE_ERRORS = {
  ENTRY_ALREADY_EXISTS: "Api service usage entry already exists",

  // Update validation error msgs
  GREATER_THAN_MAX_NUM_USES_ERROR: `Api service call limit cannot be set to greater than ${APICallLimiter.SERVICE_API_CALL_LIMIT_ALL_USERS}`
};

export const USER_ERRORS = {
  INVALID_EMAIL: "The entered email is invalid. Please check the format.",
  INVALID_USER_TYPE: `The entered user type is invalid. Valid types are ${UserType.REG_USER} and ${UserType.ADMIN}`,
  LESS_THAN_MIN_PASSWORD_LENGTH: `Password must be ${UserService.MIN_PASSWORD_LENGTH} characters or more`,
  MISSING_USER_ID: "No user id was provided of the user to update"
};

export const USER_MESSAGES = {
  DELETED_USER: "Successfully deleted user with id"
};

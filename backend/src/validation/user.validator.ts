import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { HttpError } from "../errors/httpError.ts";
import { AUTH_ERRORS } from "../lang/en.ts";

export class UserValidator {
  constructor() {}

  public tryValidateUsernameAndPassword(username: string, password: string) {
    if (!username) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.EMPTY_USERNAME_ERROR);
    }
    if (!password) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.EMPTY_PASSWORD_ERROR);
    }

    //todo: add username and password restrictions (ex. length, allowed characters)
  }
}

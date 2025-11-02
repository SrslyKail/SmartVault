import { HTTP_STATUS_CODES } from "../../constants/httpResponse.ts";
import { HttpError } from "../../errors/httpError.ts";
import { AUTH_ERRORS } from "../../lang/en.ts";

export class UserValidator {
  constructor() {}

  //todo: use joi schema evaluation instead
  public tryValidateEmailAndPassword(email: string, password: string) {
    if (!email) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.EMPTY_USERNAME_ERROR);
    }
    if (!password) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.EMPTY_PASSWORD_ERROR);
    }

    //todo: add email and password restrictions (ex. length, allowed characters)
  }
}

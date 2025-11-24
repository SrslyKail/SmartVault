import { HTTP_STATUS_CODES } from "../../constants/httpResponse.ts";
import { HttpError } from "../../errors/httpError.ts";
import { AUTH_ERRORS } from "../../lang/en.ts";
import { CreateUserSchema } from "./user.validationSchema.ts";

export class UserValidator {
  constructor() {}

  public tryValidateEmailAndPassword(reqDTO: { email: string, password: string }) {
    if (!reqDTO.email) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.EMPTY_EMAIL_ERROR);
    }
    if (!reqDTO.password) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.EMPTY_PASSWORD_ERROR);
    }

    const parsedResult = CreateUserSchema.safeParse(reqDTO);
    
    if (!parsedResult.success) {
      const errorMsgs = parsedResult.error.issues.map(err => err.message);;
      const errorMsgsString = JSON.stringify(errorMsgs);

      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, errorMsgsString);
    }
    
    return parsedResult.data;
  }
}

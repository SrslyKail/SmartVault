import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { HTTP_ERRORS } from "../lang/en.ts";
import { logger } from "../services/logger.service.ts";

export class HttpError extends Error {

  httpStatusCode;

  constructor(httpStatusCode: number, message: string) {
    super(message);
    this.httpStatusCode = httpStatusCode;
  }

  static extractErrorCodeAndMessage(error: unknown) {

    logger.info(`${(error as any).message}`);


    let errorCode = HTTP_STATUS_CODES.SERVER_ERROR;
    let errorMsg  = HTTP_ERRORS.SERVER_ERROR;

    if (error instanceof HttpError) {
      errorCode = error.httpStatusCode;
      errorMsg  = error.message;
    }
        

    return { code: errorCode, message: (errorCode === HTTP_STATUS_CODES.SERVER_ERROR) ? HTTP_ERRORS.SERVER_ERROR : errorMsg }
  }
}

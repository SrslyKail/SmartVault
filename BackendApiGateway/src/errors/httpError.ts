import axios from "axios";
import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { HTTP_ERRORS } from "../lang/en.ts";
import { logger } from "../services/logger.service.ts";

export class HttpError extends Error {

  private httpStatusCode;

  constructor(httpStatusCode: number, message: string) {
    super(message);
    this.httpStatusCode = httpStatusCode;
  }

  public static extractErrorCodeAndMessage(error: unknown, errorMessageKey?: string) {

    let errorCode = HTTP_STATUS_CODES.SERVER_ERROR;
    let errorMsg  = HTTP_ERRORS.SERVER_ERROR;

    if (axios.isAxiosError(error)) {
      const axiosErrorCode = error.status;
      if (axiosErrorCode) {
        errorCode = axiosErrorCode;

        errorMsg = errorMessageKey 
          ? (error.response?.data[errorMessageKey] || error.message)
          : error.message;
      }
    }
    else if (error instanceof HttpError) {
      errorCode = error.httpStatusCode;
      errorMsg  = error.message;
    }

    //todo: remove
    logger.info(`${errorCode}: ${errorMsg}`);

    return { code: errorCode, message: (errorCode === HTTP_STATUS_CODES.SERVER_ERROR) ? HTTP_ERRORS.SERVER_ERROR : errorMsg }
  }
}

import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { prisma } from "../data/db.ts";
import type { UserApiServiceUsage } from "../data/models/generated/prisma/client.ts";
import { HttpError } from "../errors/httpError.ts";
import { API_SERVICE_USAGE_ERRORS, HTTP_ERRORS } from "../lang/en.ts";

export class UserApiUsageService {

  constructor() {}

  /**
   * Creates a new user api usage entry for the given user with their id.
   * @param userId a string
   * @returns UserApiServiceUsage (await)
   */
  public async createNewUserApiUsageEntry(userId: string): Promise<UserApiServiceUsage> {

    const foundUserApiServiceUsage: UserApiServiceUsage | null = await this.findUserApiUsageEntryByUserId(userId);

    if (foundUserApiServiceUsage) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, API_SERVICE_USAGE_ERRORS.ENTRY_ALREADY_EXISTS);
    }

    const newUserApiServiceUsage: UserApiServiceUsage = await prisma.userApiServiceUsage.create({
      data: {
        userId: userId
      }
    });

    return newUserApiServiceUsage;
  }

  /**
   * Finds and increments the number of api calls used by 1, for the user with the given user id.
   * @param userId a string
   * @returns currentNumApiCallsUsed - a number - the updated total num api called used by the user.
   * @throws  HttpError (NOT_FOUND error) if the UserApiServiceUsage entry could not be found. 
   */
  public incrementNumberOfApiCallsUsed = async (userId: string) => {

    const foundUserApiServiceUsage: UserApiServiceUsage = await this.tryFindUserApiUsageEntryByUserId(userId);

    // update entry by user id
    const updatedUserApiServiceUsageEntry: UserApiServiceUsage = await prisma.userApiServiceUsage.update({
      where: { userId: foundUserApiServiceUsage.userId },
      data: {
         totalNumApiCallsMade: {
          increment: 1
         }
      }
    });

    const currentNumApiCallsUsed: number = updatedUserApiServiceUsageEntry.totalNumApiCallsMade;

    return currentNumApiCallsUsed;
  }

  /**
   * Finds and returns the number of api calls used for the user with the given user id.
   * @param userId a string
   * @returns currentNumApiCallsUsed - a number - the total num api called used by the user.
   * @throws  HttpError (NOT_FOUND error) if the UserApiServiceUsage entry could not be found. 
   */
  public getNumberOfApiCallsUsedByUserId = async (userId: string) => {
    const userApiServiceUsage: UserApiServiceUsage = await this.tryFindUserApiUsageEntryByUserId(userId);
    const currentNumApiCallsUsed: number = userApiServiceUsage.totalNumApiCallsMade;
    return currentNumApiCallsUsed;
  }

  /**
   * Finds and returns the UserApiServiceUsage entry for the user with the given user id.
   * @param userId a string
   * @returns userApiServiceUsage - a UserApiServiceUsage object.
   * @throws  HttpError (NOT_FOUND error) if the UserApiServiceUsage entry could not be found. 
   */
  private tryFindUserApiUsageEntryByUserId = async (userId: string) => {
    const userApiServiceUsage: UserApiServiceUsage | null = await this.findUserApiUsageEntryByUserId(userId);

    if (!userApiServiceUsage) {
      throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, HTTP_ERRORS.RESOURCE_NOT_FOUND_ERROR);
    }

    return userApiServiceUsage;
  }

    /**
     * Finds and returns the UserApiServiceUsage entry for the user with the given user id.
     * @param userId a string
     * @returns userApiServiceUsage - a UserApiServiceUsage object, otherwise null if not found.
     */
    private findUserApiUsageEntryByUserId = async (userId: string) => {
    // find entry by user id
    const userApiServiceUsage: UserApiServiceUsage | null = await prisma.userApiServiceUsage.findUnique({
      where: { userId: userId }
    });

    return userApiServiceUsage;
  }
}

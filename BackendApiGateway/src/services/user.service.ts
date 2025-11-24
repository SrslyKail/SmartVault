import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { HttpError } from "../errors/httpError.ts";
import { API_SERVICE_USAGE_ERRORS, AUTH_ERRORS, USER_ERRORS } from "../lang/en.ts";
import bcrypt from "bcrypt";
import { logger } from "./logger.service.ts";
import { UserType, type User, type UserApiServiceUsage } from "../data/models/generated/prisma/client.ts";
import { prisma } from "../data/db.ts";
import { APICallLimiter } from "../lib/apiCallLimit.ts";
import type { UserApiUsageService } from "./userApiUsageService.service.ts";
import type { UpdateUserRequestDTO } from "../types/index.ts";
import { removeUndefinedObjectProps } from "../utils/removeUndefinedProps.ts";

export class UserService {

  private static readonly NUM_SALT_ROUNDS = 10;
  private static readonly DEFAULT_USER_TYPE = UserType.REG_USER;
  
  public static readonly MIN_PASSWORD_LENGTH = 6;

  private readonly userApiUsageService: UserApiUsageService;

  constructor(
    userApiUsageService: UserApiUsageService
  ) {
    this.userApiUsageService = userApiUsageService;
  }

  public async createNewUser(email: string, password: string): Promise<User> {

    if (password.length < UserService.MIN_PASSWORD_LENGTH) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, USER_ERRORS.LESS_THAN_MIN_PASSWORD_LENGTH);
    }

    const hashedPassword = await UserService.hashPassword(password);

    const newUser: User = await prisma.user.create({
      data: {
        email: email,
        hashedPassword: hashedPassword,
        userType: UserService.DEFAULT_USER_TYPE,
        apiServiceCallLimit: APICallLimiter.SERVICE_API_CALL_LIMIT_ALL_USERS,
        
        // nested create to link a new refreshTokenInfo entity to the user entity by user id
        refreshTokenInfo: {
          create: {}
        }
      }
    });

    await this.userApiUsageService.createNewUserApiUsageEntry(newUser.id);

    logger.info(`Created new user: ${newUser.email} ${newUser.userType}`);

    return newUser;
  }

  public async getUserById(userId: string): Promise<User | null> {
    // find by unique id
    const user: User | null = await prisma.user.findUnique({
       where: { id: userId }
    });

    return user;
  }

  public async findUserByEmail(userEmail: string): Promise<User | null> {
    // find by unique email
    const user: User | null = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    return user;
  }

  public async tryFindUserByEmailAndPassword(email: string, password: string): Promise<User> {

    const user: User | null = await this.findUserByEmail(email);

    // if user email does not exist
    if (!user) {
      throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, AUTH_ERRORS.USER_NOT_FOUND_WITH_EMAIL_ERROR);
    }

    const compareResult: boolean = await bcrypt.compare(password, user.hashedPassword);

    // if entered password was incorrect
    if (!compareResult) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.INCORRECT_PASSWORD_ERROR);
    }

    return user;
  }

  public async updateUser(updateUserValues: UpdateUserRequestDTO): Promise<User> {

    const foundUser: User | null = await this.getUserById(updateUserValues.id);

    // if user does not exist
    if (!foundUser) {
      throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, AUTH_ERRORS.USER_NOT_FOUND_WITH_ID_ERROR);
    }

    const apiServiceCallLimit: number | undefined = updateUserValues.apiServiceCallLimit;
    const email: string | undefined = updateUserValues.email
    // const password: string | undefined = updateUserValues.password

    // === domain / business logic level validation ===
    if (
      apiServiceCallLimit && 
      apiServiceCallLimit > APICallLimiter.SERVICE_API_CALL_LIMIT_ALL_USERS
    ) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, API_SERVICE_USAGE_ERRORS.GREATER_THAN_MAX_NUM_USES_ERROR);
    }

    if (email) {
      const existingUser = await this.findUserByEmail(email);

      // if the email is already associated with an existing user
      if (existingUser) {
        throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.EMAIL_ALREADY_EXISTS_ERROR);
      }
    }

    // if (
    //   password && 
    //   password.length < UserService.MIN_PASSWORD_LENGTH
    // ) {
    //   throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, USER_ERRORS.LESS_THAN_MIN_PASSWORD_LENGTH);
    // }

    // // hash password
    // const hashedPassword = password ? await UserService.hashPassword(password) : undefined;

    // remove undefined fields
    const userPropsToUpdate = removeUndefinedObjectProps(updateUserValues);

    // // remove plain text password
    // delete userPropsToUpdate.password;

    const updatedUser: User = await prisma.user.update({
      where: { id: foundUser.id },
      data: {

        ...userPropsToUpdate,
        // hashedPassword: hashedPassword
      }
    });

    return updatedUser;
  }

  public async deleteUserWithId(userId: string) {
    const foundUser: User | null = await this.getUserById(userId);

    // if user does not exist
    if (!foundUser) {
      throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, AUTH_ERRORS.USER_NOT_FOUND_WITH_ID_ERROR);
    }

    await prisma.user.delete({
      where: { id: userId }
    });
  }

  private static async hashPassword(password: string) {
    const hashedPassword = await bcrypt.hash(password, UserService.NUM_SALT_ROUNDS);
    return hashedPassword;
  }
}

import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { HttpError } from "../errors/httpError.ts";
import { AUTH_ERRORS } from "../lang/en.ts";
import bcrypt from "bcrypt";
import { logger } from "./logger.service.ts";
import { ObsidianVaultMCPService } from "./obsidianVaultMCP.service.ts";
import type { User } from "../data/models/generated/prisma/client.ts";
import { prisma } from "../data/db.ts";

export class UserService {

  private static readonly NUM_SALT_ROUNDS = 10;
  private static readonly DEFAULT_USER_ADMIN_STATUS = false;

  constructor() {}

  public async createNewUser(email: string, password: string): Promise<User> {

    const hashedPassword = await bcrypt.hash(password, UserService.NUM_SALT_ROUNDS);

    const newUser: User = await prisma.user.create({
      data: {
        email: email,
        hashedPassword: hashedPassword,
        isAdmin: UserService.DEFAULT_USER_ADMIN_STATUS,
        obsVaultMcpTokenLimit: ObsidianVaultMCPService.SERVICE_API_CALL_LIMIT_REGULAR_USER,
        obsVaultMcpTokensUsed: ObsidianVaultMCPService.INITIAL_NUM_SERVICE_API_CALLS,
        
        // nested create to link a new refreshTokenInfo entity to the user entity by user id
        refreshTokenInfo: {
          create: {}
        }
      }
    });

    logger.info(`Created new user: ${newUser.email} ${newUser.isAdmin}`);

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
}

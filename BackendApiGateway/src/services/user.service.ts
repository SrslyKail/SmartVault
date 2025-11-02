import { HTTP_STATUS_CODES } from "../constants/httpResponse.ts";
import { HttpError } from "../errors/httpError.ts";
import { AUTH_ERRORS } from "../lang/en.ts";
import bcrypt from "bcrypt";
import type { User } from "../types/index.ts";
import { logger } from "./logger.service.ts";

export class UserService {

  private static NUM_SALT_ROUNDS = 10;  

  //todo: add db with users table
  private users: User[];

  constructor() {
    this.users = [];
  }

  public async createNewUser(email: string, password: string): Promise<User> {

    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, UserService.NUM_SALT_ROUNDS);

    const user: User = {
      id: id,
      email: email,
      hashedPassword: hashedPassword
    };

    //todo: Prisma DB insert
    this.users.push(user);

    logger.info(`Current users:`);
    logger.info(this.users);

    return user;
  }

  public async findUserByUsername(email: string): Promise<User | null> {
    //todo: Prisma find one DB select unique
    const user: User | undefined = this.users.find((user) => user.email === email);
    return user ?? null;
  }

  public async tryFindUserByUsernameAndPassword(email: string, password: string): Promise<User> {

    //todo: Prisma find one DB select unique
    const user: User | null = await this.findUserByUsername(email);

    // If user email does not exist
    if (!user) {
      throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, AUTH_ERRORS.USER_NOT_FOUND_ERROR);
    }

    const compareResult: boolean = await bcrypt.compare(password, user.hashedPassword);

    // If entered password was incorrect
    if (!compareResult) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, AUTH_ERRORS.INCORRECT_PASSWORD_ERROR);
    }

    return user;
  }
}

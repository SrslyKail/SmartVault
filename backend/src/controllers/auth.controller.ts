import type { Request, Response } from 'express'
import type { AuthTokenService } from '../services/authToken.service.ts';
import { HttpError } from '../errors/httpError.ts';
import { logger } from '../services/logger.service.ts';
import type { UserService } from '../services/user.service.ts';
import type { User } from '../types/index.ts';
import { HTTP_STATUS_CODES } from '../constants/httpResponse.ts';
import type { UserValidator } from '../validation/user.validator.ts';

export class AuthController {

  //jwt token generator and issuer
  private authTokenService: AuthTokenService;
  private userService:      UserService;
  private userValidator:    UserValidator;

  constructor(
    authTokenService: AuthTokenService,
    userService:      UserService,
    userValidator:    UserValidator
  ) {
    this.authTokenService = authTokenService;
    this.userService      = userService;
    this.userValidator    = userValidator;
  }

  public async login(req: Request, res: Response) {
    try {

      // console.log("recieved request");

      const { username, password, } = req.body;
      
      const user: User = await this.userService.tryFindUserByEmailAndPassword(username, password);

      const jwtToken = "1234";//this.authTokenService.<>(user);

      const resData = {
        accessToken: jwtToken
      }

      logger.info(
        `User signed in with: ${user.id}, username: ${username}`
      );

      res.status(HTTP_STATUS_CODES.OK).json(resData);
    }
    catch (error) {
      const { code, message } = HttpError.extractErrorCodeAndMessage(error);
      logger.error(
        `Username: ${req.body.username}, Password: ${req.body.password}, ${code}, ${message}`
      );
      const resData = { message: message };

      res.status(code).json(resData);
    }
  }

  public async signup(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      //todo: validate username and password
      this.userValidator.tryValidateUsernameAndPassword(username, password);
      
      const user: User = await this.userService.createNewUser(username, password);

      const jwtToken = "1234";//this.authTokenService.<>(user);

      const resData = {
        accessToken: jwtToken
      }

      logger.info(
        `User created with id: ${user.id}, username: ${user.username}, hashed password: ${user.hashedPassword}`
      );

      res.status(HTTP_STATUS_CODES.CREATED).json(resData);
    }
    catch (error) {
      const { code, message } = HttpError.extractErrorCodeAndMessage(error);
      logger.error(
        `Username: ${req.body.username}, Password: ${req.body.password}, ${code}, ${message}`
      );
      const resData = { message: message };

      res.status(code).json(resData);
    }
  }

  public authenticate(req: Request, res: Response) {

  }
}

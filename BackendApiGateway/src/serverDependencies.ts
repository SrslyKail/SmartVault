import { AuthController } from "./controllers/auth.controller.ts";
import { AuthTokenService } from "./services/authToken.service.ts";
import { UserService } from "./services/user.service.ts";
import { UserValidator } from "./validation/user/user.validator.ts";

// Services
const userService      = new UserService();
const authTokenService = new AuthTokenService(userService);
const userValidator    = new UserValidator();

// Controllers
export const authController   = new AuthController(authTokenService, userService, userValidator);

import { AuthController } from "./controllers/auth.controller.ts";
import { AuthTokenService } from "./services/authToken.service.ts";
import { UserService } from "./services/user.service.ts";
import { UserValidator } from "./validation/user.validator.ts";

// Services
const authTokenService = new AuthTokenService();
const userService      = new UserService();
const userValidator    = new UserValidator();

// Controllers
export const authController   = new AuthController(authTokenService, userService, userValidator);

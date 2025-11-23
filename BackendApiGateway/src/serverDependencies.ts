import { AuthController } from "./controllers/auth.controller.ts";
import { ObsVaultController } from "./controllers/obsVault.Controller.ts";
import { UsersController } from "./controllers/users.controller.ts";
import { AuthTokenService } from "./services/authToken.service.ts";
import { ObsidianVaultMCPService } from "./services/obsidianVaultMCP.service.ts";
import { UserService } from "./services/user.service.ts";
import { UserValidator } from "./validation/user/user.validator.ts";

// Services
const userService      = new UserService();
const authTokenService = new AuthTokenService(userService);
const userValidator    = new UserValidator();
const obsVaultService = new ObsidianVaultMCPService();

// Controllers
export const authController   = new AuthController(authTokenService, userService, userValidator);
export const usersController  = new UsersController(userService);
export const obsVaultController = new ObsVaultController(obsVaultService);
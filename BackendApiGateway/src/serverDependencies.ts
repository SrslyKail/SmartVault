import { AuthController } from "./controllers/auth.controller.ts";
import { ObsVaultController } from "./controllers/obsVault.Controller.ts";
import { UsersController } from "./controllers/users.controller.ts";
import { APICallLimiter } from "./lib/apiCallLimit.ts";
import { AuthTokenService } from "./services/authToken.service.ts";
import { ObsidianVaultMCPService } from "./services/obsidianVaultMCP.service.ts";
import { UserService } from "./services/user.service.ts";
import { UserApiUsageService } from "./services/userApiUsageService.service.ts";
import { ObsidianVaultMCPValidator } from "./validation/mcpPrompt/mcpPrompt.validator.ts";
import { UserValidator } from "./validation/user/user.validator.ts";

// Services
const userApiUsageService = new UserApiUsageService();
const userService         = new UserService(userApiUsageService);
const authTokenService    = new AuthTokenService(userService);
const obsVaultService     = new ObsidianVaultMCPService();

// Validators
const userValidator       = new UserValidator();
const mcpPromptValidator  = new ObsidianVaultMCPValidator();

// Helpers
const apiCallLimiter = new APICallLimiter(userApiUsageService);

// Controllers
export const authController     = new AuthController(authTokenService, userService, userValidator);
export const usersController    = new UsersController(userService);
export const obsVaultController = new ObsVaultController(obsVaultService, mcpPromptValidator, apiCallLimiter, userApiUsageService);
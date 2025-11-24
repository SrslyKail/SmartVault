import dotenv from "dotenv";
dotenv.config();
import express from 'express'
// import type { Request, Response } from 'express'
import { authController, obsVaultController, usersController } from './serverDependencies.ts';
// import { HTTP_STATUS_CODES } from './constants/httpResponse.ts';
import cookieParser from "cookie-parser";
import cors from 'cors';
// import { McpChatHub } from "./middleware/mcpChatHub.ts"
import { uncapitalizeReqBodyProperties } from "./middleware/uncapitalizeProps.ts";
import { UserType } from "./data/models/generated/prisma/enums.ts";

const port = process.env.BACKEND_API_PORT || 8001;
const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN;

if (!allowedOrigin) {
  throw new Error("ALLOWED_ORIGIN not set to env variable");
}

// adds the included headers allow origin and allow credentials in the res object
const corsHandler = cors({
  origin: allowedOrigin,  // Access-Control-Allow-Origin header value (string of the required origin) 
  credentials: true,      // Access-Control-Allow-Credentials header value (boolean value representing if credentials like cookies can be sent)
});

// use cors middleware for all routes and methods (done for every request)
// ensure that all requests must include the correct headers
app.use(corsHandler); // Access-Control-Allow-Methods - ALL http methods

// handle browser initiated options request for preflight request type - for ALL routes 
// using named wildcard parameter to satisfy Express 5
app.options("/{*path}", corsHandler);

// Parse cookies from incoming request
app.use(cookieParser());

// Parse incoming requests into json
app.use(express.json());

// Uncapitalize all properties from the request body (asp.net core models require fields to be capitalized)
app.use(uncapitalizeReqBodyProperties);

// const getHelloMsg = (req: Request, res: Response) => {
//   res.status(HTTP_STATUS_CODES.OK).send("Hello World");
// }

// app.get("/", getHelloMsg);

// === Auth endpoints ===
app.post("/api/auth/login", authController.login.bind(authController));
app.post("/api/auth/signup", authController.signup.bind(authController));
app.post("/api/auth/logout", authController.authenticate.bind(authController), authController.logout.bind(authController));
app.get("/api/auth/me", authController.authenticate.bind(authController), usersController.getCurrentUser.bind(usersController));

// === User related endpoints ===

app.patch("/api/admin/users", 
  authController.authenticate.bind(authController),
  (req, res, next) => authController.checkIfAuthorized(req, res, UserType.ADMIN, next),
  usersController.patchUpdateUser.bind(usersController)
);

// === Obsidian Vault MCP endpoints (currently limited to 20 for all users) ===
app.post("/api/obs-vault/chat", authController.authenticate.bind(authController), obsVaultController.createPromptAndGetResponse.bind(obsVaultController));

app.listen(port, () => console.log(`App is listening on port ${port} - http://localhost:${port}`));

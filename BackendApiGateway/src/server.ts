import dotenv from "dotenv";
dotenv.config();
import express from 'express'
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Vault',
      version: '1.0.0',
    },
  },
  apis: ['./src/*.ts']
};
const swaggerSpec = swaggerJSDoc(options);
import { authController, obsVaultController, usersController } from './serverDependencies.ts';
import cookieParser from "cookie-parser";
import cors from 'cors';
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

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === Auth endpoints ===
/**
 * @openapi
 * /api/auth/login:
 *  post:
 *    summary: Logs in a user, given they have an auth cookie
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema: 
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: The users email
 *              password:
 *                type: string
 *                description: The users password
 *            required:
 *              - email
 *              - password
 *  responses:
 *    200:
 *      description: The login was successful
 */
app.post("/api/auth/login", authController.login.bind(authController));

/**
 * @openapi
 * /api/auth/signup:
 *  post:
 *    summary: Sign up and get an auth cookie
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema: 
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: The users email
 *              password:
 *                type: string
 *                description: The users password
 *            required:
 *              - email
 *              - password
 *  responses:
 *    200:
 *      description: The signup was successful
 */
app.post("/api/auth/signup", authController.signup.bind(authController));

/**
 * @openapi
 * /api/auth/logout:
 *  post:
 *    summary: Logs a user out via their auth cookie
 *    parameters:
 *      - name: authcookie
 *        in: cookie
 *        required: true
 *        description: Authentication cookie from logging in
 *        schema:
 *          type: integer
 *          format: int64
 *  responses:
 *    200:
 *      description: The log out was successful
 */
app.post("/api/auth/logout", authController.authenticate.bind(authController), authController.logout.bind(authController));

/**
 * @openapi
 * /api/auth/me:
 *  get:
 *    summary: Gets information about the current user
 *    parameters:
 *      - name: authcookie
 *        in: cookie
 *        required: true
 *        description: Authentication cookie from logging in
 *        schema:
 *          type: integer
 *          format: int64
 *        
 *  responses:
 *    200:
 *      description: The information
 */
app.get("/api/auth/me", authController.authenticate.bind(authController), usersController.getCurrentUser.bind(usersController));
app.get("/api-doc", swaggerUi.setup(swaggerSpec));

// === User related endpoints ===

// --- ADMIN ONLY ---
/**
 * @openapi
 * /api/admin/users/:id::
 *  patch:
 *    summary: Updates the user with the given ID
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: ID of the user to update
 *        schema:
 *          type: integer
 *          format: int64
 *    requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema: 
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: The users email
 *              userType:
 *                type: integer
 *                description: Enum of the users type
 *              apiServiceCallLimit:
 *                type: integer
 *                description: The amount of calls the user can make
 *            required:
 *              - email
 *              - password
 *        
 *  responses:
 *    200:
 *      description: The user has been updated
 */
app.patch("/api/admin/users/:id", 
  authController.authenticate.bind(authController),
  (req, res, next) => authController.checkIfAuthorized(req, res, UserType.ADMIN, next),
  usersController.updateUserById.bind(usersController)
);

// --- ADMIN ONLY ---
/**
 * @openapi
 * /api/admin/users/:id::
 *  delete:
 *    summary: delete the user with the given ID
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: ID of the user to delete
 *        schema:
 *          type: integer
 *          format: int64
 *        
 *  responses:
 *    200:
 *      description: The user has been deleted
 */
app.delete("/api/admin/users/:id", 
  authController.authenticate.bind(authController),
  (req, res, next) => authController.checkIfAuthorized(req, res, UserType.ADMIN, next),
  usersController.deleteUserById.bind(usersController)
);

// === Obsidian Vault MCP endpoints (currently limited to 20 for all users) ===
app.post("/api/obs-vault/chat", authController.authenticate.bind(authController), obsVaultController.createPromptAndGetResponse.bind(obsVaultController));

app.listen(port, () => console.log(`App is listening on port ${port} - http://localhost:${port}`));

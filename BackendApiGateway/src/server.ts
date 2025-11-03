import dotenv from "dotenv";
dotenv.config();
import express from 'express'
import type { Request, Response } from 'express'
import { authController, usersController } from './serverDependencies.ts';
import { HTTP_STATUS_CODES } from './constants/httpResponse.ts';
import cookieParser from "cookie-parser";

const port = process.env.PORT || 8000;
const app = express();

// Parse incoming requests into json
app.use(express.json());

// no secret key
app.use(cookieParser());

// const getHelloMsg = (req: Request, res: Response) => {
//   res.status(HTTP_STATUS_CODES.OK).send("Hello World");
// }

// app.get("/", getHelloMsg);
app.post("/api/auth/login", authController.login.bind(authController));
app.post("/api/auth/signup", authController.signup.bind(authController));
app.post("/api/auth/logout", authController.authenticate.bind(authController), authController.logout.bind(authController));
app.get("/api/auth/me", authController.authenticate.bind(authController), usersController.getCurrentUser.bind(authController));

app.listen(port, () => console.log("App is listening on port 8000 - http://localhost:8000"));

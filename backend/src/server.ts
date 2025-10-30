import express from 'express'
import type { Request, Response } from 'express'
import { authController } from './serverDependencies.ts';
import { HTTP_STATUS_CODES } from './constants/httpResponse.ts';

const port = process.env.PORT || 8000;
const app = express();

// Parse incoming requests into json
app.use(express.json());

const getHelloMsg = (req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).send("Hello World");
}

app.get("/", getHelloMsg);
app.post("/api/auth/login", authController.login.bind(authController));
app.post("/api/auth/signup", authController.signup.bind(authController));

app.listen(port, () => console.log("App is listening on port 8000 - http://localhost:8000"));

import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

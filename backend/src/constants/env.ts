import createHttpError from "http-errors";
import { BAD_REQUEST } from "@/constants/http";

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    /* istanbul ignore next */
    throw createHttpError(BAD_REQUEST);
  }

  return value;
};

export const NODE_ENV = getEnv("NODE_ENV", "dev");
export const PORT = getEnv("PORT", "5000");
export const MONGO_URI = getEnv("MONGO_URI");
export const APP_ORIGIN = getEnv("APP_ORIGIN", "http://localhost:5000");
export const CLIENT_ORIGIN = getEnv("CLIENT_ORIGIN", "http://localhost:3000");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const EMAIL_USER = getEnv("EMAIL_USER");
export const EMAIL_PASS = getEnv("EMAIL_PASS");

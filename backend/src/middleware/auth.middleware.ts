import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/constants/env";
import createHttpError from "http-errors";
import { UNAUTHORIZED } from "@/constants/http";
import { Types } from "mongoose";
import { AuthRequest } from "@/types/types";
import Blacklist from "@/models/blacklists.model";

export const generateToken = (user: AuthRequest) => {
  const signedJwt = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  return signedJwt;
};

export const generateShortToken = (user: AuthRequest) => {
  const signedJwt = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );
  return signedJwt;
};

export const isAuth: RequestHandler = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const checkBlacklist = await Blacklist.findOne({ token: authorization });
    if (checkBlacklist) {
      return next(createHttpError(UNAUTHORIZED, "Token revoked"));
    }
    if (!authorization) {
      return next(createHttpError(UNAUTHORIZED, "Access Denied"));
    }
    const token = authorization.split(" ")[1];
    const decode = jwt.verify(token, JWT_SECRET);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const decodedToken = decode as {
      _id: Types.ObjectId;
      email: string;
      name: string;
      iat: number;
      exp: number;
    };
    next();
  } catch (err) {
    const errorMessage =
      (err as jwt.JsonWebTokenError).name === "TokenExpiredError"
        ? "Token expired"
        : (err as jwt.JsonWebTokenError).name === "JsonWebTokenError" && (err as Error).message === "jwt malformed"
          ? "Malformed token"
          : "Access Denied";

    return next(createHttpError(UNAUTHORIZED, errorMessage));
  }
};

export const verifyAuthorization = async (authorization: string) => {
  const token = authorization.split(" ")[1];
  try {
    const res = jwt.verify(token, JWT_SECRET) as {
      _id: Types.ObjectId;
      email: string;
      name: string;
      iat: number;
      exp: number;
    };
    return res;
  } catch (err) {
    const errorMessage =
      (err as jwt.JsonWebTokenError).name === "TokenExpiredError"
        ? "Token expired"
        : (err as jwt.JsonWebTokenError).name === "JsonWebTokenError" && (err as Error).message === "jwt malformed"
          ? "Malformed token"
          : "Access Denied";

    throw createHttpError(UNAUTHORIZED, errorMessage);
  }
};

import { RequestHandler } from "express";
import createHttpError from "http-errors";
import Model, { fields } from "@/models/users.model";
import Blacklist from "@/models/blacklists.model";

import bcrypt from "bcrypt";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK, UNAUTHORIZED } from "@/constants/http";
import { generateShortToken, generateToken, verifyAuthorization } from "@/middleware/auth.middleware";
import mongoose from "mongoose";
import { AuthRequest } from "@/types/types";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import {
  EMAIL_USER,
  EMAIL_PASS,
  CLIENT_ORIGIN,
  //APP_ORIGIN,
} from "@/constants/env";
import { engineCreateUpdate, engineGetOne } from "@/middleware/engine.middleware";
import { hashPassword } from "@/utils/utlis";

export const register: RequestHandler = async (req, res, next) => {
  const requiredFields = ["name", "email", "password"];

  const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === "");

  if (missingFields.length > 0) {
    return next(createHttpError(BAD_REQUEST, `${missingFields.join(", ")} required`));
  }

  // START TRANSACTION (IF EVERYTHING SUCCEEDS)
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // USERS
    const checkExist = await Model.findOne({
      email: req.body.email,
      verified: false,
    }).exec();

    let generateId;
    if (checkExist) {
      generateId = checkExist._id;
    } else {
      generateId = new mongoose.Types.ObjectId();
    }
    req.body.verified = false;
    const requestValues = await engineCreateUpdate(Model, fields, req, false);

    let data;
    if (checkExist) {
      await Model.updateOne({ _id: generateId, parent: generateId }, requestValues, { session });
      data = await Model.findOne({
        _id: generateId,
        parent: generateId,
      }).session(session);
    } else {
      data = await Model.create([requestValues], { session });
      data = data[0];
    }
    delete req.body._id;

    // COMMIT TRANSACTION (IF EVERYTHING SUCCEEDS)
    await session.commitTransaction();
    session.endSession();

    // GET FINAL DATA
    // prettier-ignore
    const resultUser = await engineGetOne(
      Model,                    // collections user
      fields,                   // fields user
      data._id,                 // moduleId user
      generateId,               // userId user
    );
    console.log(resultUser);

    // RETURN RESPONSE
    res.status(CREATED).json(resultUser);
  } catch (error) {
    // ROLLBACK TRANSACTION IF ANY ERROR OCCURS
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const sendVerifyEmail: RequestHandler = async (req, res, next) => {
  const requiredFields = ["email"];

  const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === "");

  if (missingFields.length > 0) {
    return next(createHttpError(BAD_REQUEST, `${missingFields.join(", ")} required`));
  }
  const { email } = req.body;
  try {
    const user = await Model.findOne({
      email,
      verified: false,
    }).exec();
    if (!user) {
      return next(createHttpError(NOT_FOUND, "User not found or already verified"));
    }
    const tokenPayload: AuthRequest = {
      _id: user._id,
      email: String(user.email),
      name: String(user.name),
    };

    const verifyLink = CLIENT_ORIGIN + "/email/verify?authorization=" + generateShortToken(tokenPayload);

    const transporter = nodemailer.createTransport({
      host: "mail.reyhanjs.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "WorkLife",
        link: CLIENT_ORIGIN,
        logo: "https://reyhanjs.com/logotext.png",
        logoHeight: "90px",
        copyright: `Copyright © ${new Date().getFullYear()} WorkLife. All rights reserved.`,
      },
    });

    const emailContent = {
      body: {
        name: String(user.name),
        intro: "Please verify your email address to complete your registration.",
        action: {
          instructions: "Click the button below to verify your email:",
          button: {
            color: "#007bff",
            text: "Verify Email",
            link: verifyLink,
          },
        },
        outro: "If you did not sign up, you can ignore this email.",
      },
    };

    const emailHtml = mailGenerator.generate(emailContent);

    await transporter.sendMail({
      from: `WorkLife <donotreply@reyhanjs.com>`,
      to: String(user.email),
      subject: "Email Verification Request",
      html: emailHtml,
    });

    res.status(OK).json({ message: "Verification email sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    const user = await Model.findOne({
      _id: String(decodedToken._id),
      email: String(decodedToken.email),
      verified: false,
    });
    if (!user) {
      return next(createHttpError(NOT_FOUND, "User not found"));
    }
    user.verified = true;
    await user.save();
    await Blacklist.create({ token: req.headers.authorization });
    const tokenPayload: AuthRequest = {
      _id: user._id,
      email: String(user.email),
      name: String(user.name),
    };
    const token = generateToken(tokenPayload);
    res.status(OK).json({ ...tokenPayload, token });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  const requiredFields = ["email", "password"];

  const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === "");

  if (missingFields.length > 0) {
    return next(createHttpError(BAD_REQUEST, `${missingFields.join(", ")} required`));
  }

  const { email, password } = req.body;
  try {
    const user = await Model.findOne({ email, verified: true }).select("+password").exec();

    if (!user || typeof user.password !== "string") {
      return next(createHttpError(UNAUTHORIZED, "Invalid email or password. Make sure your email is verified."));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(UNAUTHORIZED, "Invalid email or password. Make sure your email is verified."));
    }

    const tokenPayload: AuthRequest = {
      _id: user._id,
      email: String(user.email),
      name: String(user.name),
    };
    const token = generateToken(tokenPayload);
    /*const requestOrigin = req.get("origin");

    if (requestOrigin === APP_ORIGIN) {
      res.status(OK).type("text/plain").send(token);
      return;
    }*/
    res.status(CREATED).json({ ...tokenPayload, token });
  } catch (error) {
    next(error);
  }
};

export const sendForgotPasswordEmail: RequestHandler = async (req, res, next) => {
  const requiredFields = ["email"];

  const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === "");

  if (missingFields.length > 0) {
    return next(createHttpError(BAD_REQUEST, `${missingFields.join(", ")} required`));
  }
  const { email } = req.body;
  try {
    const user = await Model.findOne({
      email,
      verified: true,
    }).exec();
    if (!user) {
      return next(createHttpError(NOT_FOUND, "User not found or already verified"));
    }

    const tokenPayload: AuthRequest = {
      _id: user._id,
      email: String(user.email),
      name: String(user.name),
    };

    const verifyLink = CLIENT_ORIGIN + "/password/verify?authorization=" + generateShortToken(tokenPayload);

    const transporter = nodemailer.createTransport({
      host: "mail.reyhanjs.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "WorkLife",
        link: CLIENT_ORIGIN,
        logo: "https://reyhanjs.com/logotext.png",
        logoHeight: "90px",
        copyright: `Copyright © ${new Date().getFullYear()} WorkLife. All rights reserved.`,
      },
    });

    const emailContent = {
      body: {
        name: String(user.name),
        intro: "We received a request to reset your password.",
        action: {
          instructions: "Click the button below to reset your password:",
          button: {
            color: "#007bff",
            text: "Reset Password",
            link: verifyLink,
          },
        },
        outro: "If you did not request this, you can ignore this email.",
      },
    };

    const emailHtml = mailGenerator.generate(emailContent);

    await transporter.sendMail({
      from: `WorkLife <donotreply@reyhanjs.com>`,
      to: String(user.email),
      subject: "Reset Password Request",
      html: emailHtml,
    });

    res.status(OK).json({ message: "Reset password email sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const requiredFields = ["password"];
    const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === "");

    if (missingFields.length > 0) {
      return next(createHttpError(BAD_REQUEST, `${missingFields.join(", ")} required`));
    }

    const { password } = req.body;
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    const user = await Model.findOne({
      _id: String(decodedToken._id),
      email: String(decodedToken.email),
      verified: true,
    }).exec();
    if (!user) {
      return next(createHttpError(NOT_FOUND, "User not found"));
    }

    user.password = await hashPassword(password);
    await user.save();
    await Blacklist.create({ token: req.headers.authorization });

    const tokenPayload: AuthRequest = {
      _id: user._id,
      email: String(user.email),
      name: String(user.name),
    };
    const token = generateToken(tokenPayload);
    res.status(OK).json({ ...tokenPayload, token });
  } catch (error) {
    next(error);
  }
};

export const updatePassword: RequestHandler = async (req, res, next) => {
  const requiredFields = ["email", "oldPassword", "password"];
  const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === "");

  if (missingFields.length > 0) {
    return next(createHttpError(BAD_REQUEST, `${missingFields.join(", ")} required`));
  }

  const { oldPassword, password, email } = req.body;
  const decodedToken = await verifyAuthorization(req.headers.authorization);

  try {
    const moduleId = decodedToken._id;

    const user = await Model.findOne({ email, _id: moduleId }).select("+password").exec();

    if (!user) {
      return next(createHttpError(NOT_FOUND, "User not found"));
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, String(user.password));
    if (!isPasswordValid) {
      return next(createHttpError(UNAUTHORIZED, "Invalid old password"));
    }

    user.password = await hashPassword(password);
    await user.save();

    await Blacklist.create({ token: req.headers.authorization });

    const tokenPayload: AuthRequest = {
      _id: user._id,
      email: String(user.email),
      name: String(user.name),
    };
    const token = generateToken(tokenPayload);
    res.status(OK).json({ ...tokenPayload, token });
  } catch (error) {
    next(error);
  }
};

export const get: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    const user = await Model.findOne({
      _id: decodedToken._id,
      email: decodedToken.email,
    }).select("-password");
    if (!user) {
      return next(createHttpError(UNAUTHORIZED));
    }
    res.status(OK).json(user);
  } catch (error) {
    next(error);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    const user = await Model.findOne({
      _id: decodedToken._id,
      email: decodedToken.email,
    }).select("-password");
    if (!user) {
      return next(createHttpError(UNAUTHORIZED));
    }

    const tokenPayload: AuthRequest = {
      _id: user._id,
      email: String(user.email),
      name: String(user.name),
    };

    res.status(CREATED).json({ ...tokenPayload, token: generateToken(tokenPayload) });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    const user = await Model.findOne({
      _id: decodedToken._id,
      email: decodedToken.email,
    }).select("-password");
    if (!user) {
      return next(createHttpError(NOT_FOUND));
    }
    await Blacklist.create({ token: req.headers.authorization });
    res.status(OK).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

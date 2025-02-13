import { RequestHandler } from "express";
import Model, { fields } from "@/models/invoices.model";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "@/constants/http";
import { engineGetOne, engineGet, engineCreateUpdate } from "@/middleware/engine.middleware";
import { verifyAuthorization } from "@/middleware/auth.middleware";

export const get: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    req.query.parent = String(decodedToken._id);
    const result = await engineGet(Model, fields, req);
    res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getOne: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    const moduleId = req.params.moduleId;
    const userId = decodedToken._id;
    if (!mongoose.isValidObjectId(moduleId)) {
      return next(createHttpError(BAD_REQUEST, "Invalid ID"));
    }
    const result = await engineGetOne(Model, fields, moduleId, userId);
    if (!result) {
      return next(createHttpError(NOT_FOUND));
    }
    res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    const userId = decodedToken._id;
    req.body.parent = userId;
    const requestValues = await engineCreateUpdate(Model, fields, req, false);
    const data = await Model.create(requestValues);
    const result = await engineGetOne(Model, fields, data._id, userId);
    res.status(CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const decodedToken = await verifyAuthorization(req.headers.authorization);
    const moduleId = req.body.moduleId;
    const userId = decodedToken._id;
    req.body.parent = userId;
    const data = await Model.findOne({ _id: moduleId, parent: userId }).exec();
    if (!data) {
      return next(createHttpError(NOT_FOUND, "data not found"));
    }
    req.body.verified = data.verified;
    const requestValues = await engineCreateUpdate(Model, fields, req, true);
    await Model.updateOne({ _id: moduleId, parent: userId }, requestValues);
    const result = await engineGetOne(Model, fields, moduleId, userId);
    res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const del: RequestHandler = async (req, res, next) => {
  try {
    await verifyAuthorization(req.headers.authorization);
    const moduleId = req.body.moduleId;
    if (!mongoose.isValidObjectId(moduleId)) {
      return next(createHttpError(BAD_REQUEST, "Invalid ID"));
    }
    const data = await Model.findById(moduleId).exec();
    if (!data) {
      return next(createHttpError(NOT_FOUND));
    }
    const result = { ...data };
    await data.deleteOne();
    res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const bulkDel: RequestHandler = async (req, res, next) => {
  try {
    await verifyAuthorization(req.headers.authorization);
    const moduleIds = req.body.moduleIds;
    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      return next(createHttpError(BAD_REQUEST, "Invalid IDs"));
    }
    const invalidIds = moduleIds.filter((id) => !mongoose.isValidObjectId(id));
    if (invalidIds.length > 0) {
      return next(createHttpError(BAD_REQUEST, `Invalid IDs: ${invalidIds.join(", ")}`));
    }
    const objectIds = moduleIds.map((id) => new mongoose.Types.ObjectId(id));
    const result = await Model.find({ _id: { $in: objectIds } }).exec();
    if (result.length === 0) {
      return next(createHttpError(NOT_FOUND));
    }
    await Model.deleteMany({ _id: { $in: objectIds } }).exec();
    res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
};

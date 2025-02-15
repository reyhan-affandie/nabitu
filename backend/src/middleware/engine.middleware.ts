import mongoose, { Model as MongooseModel, Types } from "mongoose";
import { FieldsType, JoinCollectionType, RequestValues, SortOrderType } from "@/types/types";
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from "@/constants/http";
import createHttpError from "http-errors";
import { Request } from "express";
import { regexString } from "@/utils/regex";
import { cleanupUploadedFiles, hashPassword } from "@/utils/utlis";

export const engineGet = async <T>(Model: MongooseModel<T>, fields: FieldsType, req: Request) => {
  try {
    let limit = Number(req.query.limit);
    if (isNaN(limit) || limit < 0) {
      limit = 10;
    }
    let page = Number(req.query.page);
    if (isNaN(page) || page < 0) {
      page = 1;
    }
    const startIndex = (page - 1) * limit;
    const search = req.query.search || "";
    if (Array.isArray(search) || typeof search === "object" || typeof search !== "string" || !regexString.test(search)) {
      throw createHttpError(BAD_REQUEST);
    }
    let sort = "updatedAt";

    if (req.query.sort) {
      sort = req.query.sort.toString();
    }

    const sortOrder: SortOrderType = {};
    const order: 1 | -1 = req.query.order === "1" ? 1 : -1;
    sortOrder[sort] = order;

    const join: JoinCollectionType[] = [];
    const whereFK: RequestValues = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereSearch: any = {};
    let unSelect = "";

    const checkSearch = Object.keys(fields).filter((key) => fields[key].search === true);

    if (checkSearch.length > 0) {
      whereSearch = { $or: [] };
      checkSearch.forEach((key) => {
        whereSearch["$or"].push({
          [key]: { $regex: `.*${search}.*`, $options: "i" },
        });
      });
    }

    const checkUnselect = Object.keys(fields).filter((key) => fields[key].select === false);

    if (checkUnselect.length > 0) {
      for (const c of checkUnselect) {
        unSelect += `-${c} `;
      }
    }
    const foreignKeys = Object.keys(fields).filter((key) => fields[key].fk === true && fields[key].required === true);
    foreignKeys.forEach((key) => {
      if (fields[key].fkGet === true && (req.query[key] === "" || req.query[key] === undefined)) {
        throw createHttpError(BAD_REQUEST, `Query parameter '${key}' is required.`);
      }
      if (fields[key]) {
        join.push({
          localField: key,
          queryValue: req.query[key],
          parentUnset: "",
        });
        if (typeof req.query[key] === "string") {
          whereFK[key] = req.query[key];
        } else {
          throw createHttpError(NOT_FOUND, `Data is empty.`);
        }
      }
    });

    let query = Model.find({
      $and: [whereFK, whereSearch],
    })
      .select(unSelect)
      .sort(sortOrder)
      .limit(limit)
      .skip(startIndex);

    let total;

    if (join.length > 0) {
      for (const joinItem of join) {
        if (fields[joinItem.localField]?.parentUnset) {
          joinItem.parentUnset = fields[joinItem.localField].parentUnset.map((unset) => `-${unset}`).join(" ");
        }
        query = query.populate({
          path: joinItem.localField,
          select: joinItem.parentUnset,
        });
      }
      total = await Model.countDocuments({
        $and: [whereFK, whereSearch],
      }).exec();
    } else {
      total = await Model.countDocuments(whereSearch);
    }
    const data = await query.lean();
    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalData: total,
    };
  } catch (error) {
    if (createHttpError.isHttpError(error)) {
      throw error;
    }

    throw createHttpError(500, "An error occurred while fetching data.");
  }
};

export const engineGetOne = async <T>(
  Model: MongooseModel<T>,
  fields: FieldsType,
  moduleId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
): Promise<T | null> => {
  const unSelect = Object.keys(fields)
    .filter((key) => fields[key]?.select === false)
    .map((key) => `-${key}`)
    .join(" ");

  const baseQuery: Record<string, unknown> = { _id: moduleId };
  if (Model.collection.name !== "users") {
    Object.assign(baseQuery, { parent: userId });
  }
  return Model.findOne(baseQuery).select(unSelect).exec();
};

export const engineGetInputValues = async <T>(Model: MongooseModel<T>, fields: FieldsType, req: Request, isUpdate: boolean): Promise<RequestValues> => {
  const requestValues: RequestValues = {};

  for (const [key, field] of Object.entries(fields)) {
    const value = req.body[key];

    if (field.isImage || field.isFile) {
      if (req.files && typeof req.files === "object") {
        const files = req.files as { [key: string]: Express.Multer.File[] };
        requestValues[key] = files[key]?.[0]?.path || ""; // Ensure full path is stored
      } else {
        requestValues[key] = "";
      }
    } else if (field.isHashed && value) {
      requestValues[key] = await hashPassword(value);
    } else {
      requestValues[key] = value ?? (field.type === Number ? 0 : field.type === Boolean ? false : field.type === mongoose.Schema.Types.ObjectId ? null : "");
    }
  }
  if (Model.collection.name === "users") {
    if (!isUpdate && req.body.access === 1 && req.body._id) {
      const moduleId = req.body._id;
      if (!mongoose.isValidObjectId(moduleId)) {
        if (req.files) cleanupUploadedFiles(req);
        throw createHttpError(BAD_REQUEST, "Invalid module ID.");
      }
      requestValues._id = moduleId;
    }
  }
  return requestValues;
};

export const engineCreateUpdate = async <T>(Model: MongooseModel<T>, fields: FieldsType, req: Request, isUpdate: boolean) => {
  const errors: { status: number; message: string }[] = [];
  const fieldKeys: string[] = Object.keys(fields);
  const requestValues: RequestValues = {};

  if (isUpdate) {
    const moduleId = req.body.moduleId;
    if (!mongoose.isValidObjectId(moduleId)) {
      if (req.files) cleanupUploadedFiles(req);
      throw createHttpError(BAD_REQUEST, "Invalid module ID.");
    }
    requestValues.moduleId = moduleId;
    if (req.body.password) {
      delete req.body.password;
    }
  }
  for (let i = 0; i < fieldKeys.length; i++) {
    if ((fields[fieldKeys[i]].isImage === true || fields[fieldKeys[i]].isFile === true) && req.files) {
      const files = req.files as { [key: string]: Express.Multer.File[] };
      if (files[fieldKeys[i]]?.[0]?.filename) {
        requestValues[fieldKeys[i]] = files[fieldKeys[i]][0].filename;
      }
    } else {
      if (!isUpdate && fieldKeys[i] !== "password") {
        if (req.body[fieldKeys[i]] !== undefined) {
          requestValues[fieldKeys[i]] = req.body[fieldKeys[i]];
        } else {
          if (fields[fieldKeys[i]].required) {
            errors.push({
              status: BAD_REQUEST,
              message: `Field ${fieldKeys[i]} is required.`,
            });
          } else {
            if (fields[fieldKeys[i]].type === String) {
              requestValues[fieldKeys[i]] = "";
            } else if (fields[fieldKeys[i]].type === Number) {
              requestValues[fieldKeys[i]] = 0;
            } else if (fields[fieldKeys[i]].type === Boolean) {
              requestValues[fieldKeys[i]] = false;
            } else if (fields[fieldKeys[i]].type === mongoose.Schema.Types.ObjectId) {
              requestValues[fieldKeys[i]] = null;
            } else if (fields[fieldKeys[i]].type === Date) {
              requestValues[fieldKeys[i]] = Date.now();
            }
          }
        }
      }
    }
  }
  // Validate fields
  await Promise.all(
    Object.keys(fields).map(async (key) => {
      const field = fields[key];
      if (requestValues[key] && field.type !== Number) {
        if (key !== "moduleId" && field.required === true && !field.isFile && !field.isImage) {
          if (field.type === Number && typeof requestValues[key] === "number") {
            const minNumber = field.minLength > 1 ? Math.pow(10, field.minLength - 1) : 0;
            const maxNumber = field.maxLength > 1 ? Math.pow(10, field.maxLength) - 1 : 9;

            if (requestValues[key] < minNumber || requestValues[key] > maxNumber) {
              errors.push({
                status: BAD_REQUEST,
                message: `Field ${key} must be a valid number between ${minNumber} and ${maxNumber}.`,
              });
            }
          } else {
            const valueString = String(requestValues[key]);
            const valueLength = valueString.length;

            // Validate length
            if (field.required && (valueLength < field.minLength || valueLength > field.maxLength)) {
              errors.push({
                status: BAD_REQUEST,
                message: `Field ${key} must be between ${field.minLength} and ${field.maxLength} characters.`,
              });
            }

            // Validate regex
            if (field.regex && !field.regex.test(valueString)) {
              errors.push({
                status: BAD_REQUEST,
                message: `Field ${key} must match the pattern ${field.regex}.`,
              });
            }
          }
        }

        // Validate foreign keys
        if (field.required === true && field.fk === true && !mongoose.isValidObjectId(requestValues[key])) {
          errors.push({
            status: BAD_REQUEST,
            message: `Invalid ${key} ID`,
          });
        }

        // Check unique constraints
        if (field.unique === true) {
          if (!(Model.collection.name === "users" && req.body.verified === false)) {
            const checkUnique = await Model.findOne({
              [key]: requestValues[key],
              _id: { $ne: requestValues["moduleId"] },
            }).exec();
            if (checkUnique) {
              errors.push({
                status: CONFLICT,
                message: `Field ${key} already exists`,
              });
            }
          }
        }
      }
    }),
  );
  // If there are errors, throw a single error with all messages
  if (errors.length > 0) {
    if (req.files) cleanupUploadedFiles(req);
    const errorMessages = errors.map((error) => error.message).join(", ");
    const status = errors[0]?.status || BAD_REQUEST; // Default to BAD_REQUEST if no status provided
    throw createHttpError(status, `Validation failed: ${errorMessages}`);
  }

  // If no errors, return processed input values
  return engineGetInputValues(Model, fields, req, isUpdate);
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import jwt from "jsonwebtoken";
import mongoose, { Types } from "mongoose";
import supertest from "supertest";
import app from "@/app"; // Adjust the path if necessary
import { CREATED, OK } from "@/constants/http";
import { CreateDataFromFieldsParams, FieldsType } from "@/types/types";
import { regexBoolean, regexCountry, regexEmail, regexNumber, regexPassword, regexPhone, regexString } from "@/utils/regex";
import { JWT_SECRET } from "@/constants/env";
import { fields } from "@/models/users.model";
import fs from "fs";
import path from "path";

export const generateRandomString = (maxLength: number, stringOnly: boolean): string => {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  if (stringOnly) {
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  }
  let result = "";
  for (let i = 0; i < maxLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateRandomEmail = (maxLength: number): string => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < maxLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  result += "@testmail.com";
  return result;
};

export const generateRandomNumber = (maxLength: number): number => {
  const maxNumber = Math.pow(10, maxLength) - 1; // Maximum number based on maxLength (e.g., maxLength = 3 → 999)
  const minNumber = Math.pow(10, maxLength - 1); // Minimum number (e.g., maxLength = 3 → 100)

  // Ensure the generated number is within the range
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
};

// Generate mock JWT token
export const generateMockToken = (): string => {
  return `Bearer ${jwt.sign(
    {
      _id: new mongoose.Types.ObjectId().toString(),
      email: "test@email.com",
      name: "test name",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    JWT_SECRET,
  )}`;
};

export const generateMockTokenRandom = (_id: Types.ObjectId | string, email: string, name: string, short: boolean = false): string => {
  return `Bearer ${jwt.sign(
    {
      _id: _id,
      email: email,
      name: name,
      iat: Math.floor(Date.now() / 1000),
      exp: short ? Math.floor(Date.now() / 1000) + 60 * 15 : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    JWT_SECRET,
  )}`;
};

export const generateMockTokenExp = (_id: Types.ObjectId | string, email: string, name: string): string => {
  const iat = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 8; // 8 days ago
  const exp = Math.floor(Date.now() / 1000) - 60 * 60 * 24; // 1 days ago

  return `Bearer ${jwt.sign(
    {
      _id: _id,
      email: email,
      name: name,
      iat: iat,
      exp: exp,
    },
    JWT_SECRET,
  )}`;
};

const UPLOAD_DIR = path.join(__dirname, "../../uploads/images/users");

// Ensure the real upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Dynamically create mock data
export const createDataFromFields = ({
  fields,
  undefinedFields = [],
  overrides = {},
}: CreateDataFromFieldsParams): { body: Record<string, unknown>; files: { [key: string]: Express.Multer.File[] } } => {
  const data: Record<string, unknown> = {};
  const files: { [key: string]: Express.Multer.File[] } = {};

  Object.keys(fields).forEach((key) => {
    const maxLength = fields[key]?.maxLength || 10;

    if (undefinedFields.includes(key)) return;
    if (overrides[key] !== undefined) {
      data[key] = overrides[key];
      return;
    }

    if (key.endsWith("Date")) {
      data[key] = Date.now();
    } else if (fields[key].type === mongoose.Schema.Types.ObjectId) {
      data[key] = new mongoose.Types.ObjectId().toString();
    } else if (fields[key].regex === regexEmail) {
      data[key] = generateRandomString(10, false).toLowerCase() + "@mail.com";
    } else if (fields[key].regex === regexCountry) {
      data[key] = generateRandomString(2, true).toUpperCase();
    } else if (fields[key].regex === regexPhone) {
      data[key] = "+" + generateRandomNumber(10);
    } else if (fields[key].regex === regexPassword) {
      data[key] = generateRandomString(10, false) + generateRandomNumber(10).toString();
    } else if (fields[key].isImage === true) {
      const filename = generateRandomString(10, false).toLowerCase() + ".jpg";
      const filePath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from("Mock image data"));

      files[key] = [
        {
          fieldname: key,
          originalname: filename,
          encoding: "7bit",
          mimetype: "image/jpeg",
          path: filePath,
          buffer: fs.readFileSync(filePath),
          size: fs.statSync(filePath).size,
        } as Express.Multer.File,
      ];

      data[key] = filename;
    } else if (fields[key].isFile === true) {
      const filename = generateRandomString(10, false).toLowerCase() + ".pdf";
      const filePath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from("Mock PDF data"));

      files[key] = [
        {
          fieldname: key,
          originalname: filename,
          encoding: "7bit",
          mimetype: "application/pdf",
          path: filePath,
          buffer: fs.readFileSync(filePath),
          size: fs.statSync(filePath).size,
        } as Express.Multer.File,
      ];

      data[key] = filename;
    } else if (fields[key].regex === regexString) {
      data[key] = generateRandomString(maxLength, false);
    } else if (fields[key].regex === regexNumber) {
      data[key] = generateRandomNumber(maxLength);
    } else if (fields[key].regex === regexBoolean) {
      data[key] = Math.random() < 0.5;
    } else {
      data[key] = key;
    }
  });

  return { body: data, files };
};

// Reusable function for creating requests
export interface SupertestError extends Error {
  response?: {
    status: number;
    body: unknown;
  };
}

export const loginRequest = async (moduleUrl: string, data: Record<string, unknown>, expectation: number): Promise<supertest.Response> => {
  try {
    const response = await supertest(app)
      .post(`/api/${moduleUrl}/login`)
      .send({
        email: data.email,
        password: data.password,
      })
      .expect(expectation);
    return response;
  } catch (error) {
    const supertestError = error as SupertestError;

    if (supertestError.response?.status !== expectation) {
      console.error("Debug Info:", {
        url: `/api/${moduleUrl}/login`,
        sentData: data,
      });
    }
    throw supertestError;
  }
};

const cleanupUploadedFiles = (fields: FieldsType, responseBody: Record<string, unknown>, files: { [key: string]: Express.Multer.File[] }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Object.entries(files).forEach(([key, fileArray]) => {
    fileArray.forEach((file) => {
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error(`❌ ERROR: Failed to delete file: ${file.path}`, error);
        }
      }
    });
  });

  // ✅ Now also check API response filenames
  Object.entries(fields).forEach(([field, options]) => {
    if (options.isFile || options.isImage) {
      const responseFilePath = responseBody[field] as string | undefined;

      if (responseFilePath && fs.existsSync(responseFilePath)) {
        try {
          fs.unlinkSync(responseFilePath);
        } catch (error) {
          console.error(`❌ ERROR: Failed to delete response file: ${responseFilePath}`, error);
        }
      }
    }
  });
};

export const createRequest = async (
  fields: FieldsType,
  mockToken: string,
  moduleName: string,
  expectation: number,
  undefinedFields: string[] = [],
  overrides: Record<string, unknown> = {},
  initialData?: Record<string, unknown>, // Optionally pass initial data
): Promise<supertest.Response> => {
  const { body, files } = createDataFromFields({ fields, undefinedFields, overrides });

  let request = supertest(app).post(`/api/${moduleName}`).set("Authorization", mockToken);

  if (Object.keys(files).length > 0) {
    Object.entries({ ...body, ...initialData }).forEach(([key, value]) => {
      if (typeof value === "boolean" || typeof value === "number") {
        request.field(key, value.toString()); // Convert non-string values to strings
      } else {
        request.field(key, value as string);
      }
    });
    Object.entries(files).forEach(([key, fileArray]) => {
      if (fileArray.length > 0) {
        request.attach(key, fileArray[0].path); // Attach only the first file
      }
    });
  } else {
    // 🔥 If NO files, send JSON
    request = request.set("Content-Type", "application/json").send({ ...body, ...initialData });
  }
  try {
    const response = await request.expect(expectation);
    if (Object.keys(files).length > 0) {
      cleanupUploadedFiles(fields, response?.body, files);
    }

    return response;
  } catch (error) {
    const supertestError = error as SupertestError;

    if (supertestError.response?.status !== expectation) {
      if (Object.keys(files).length > 0) {
        cleanupUploadedFiles(fields, body, files);
      }
      console.error("Debug Info:", {
        url: `/api/${moduleName}`,
        method: "post",
        sentData: { body, files },
      });
    }
    throw supertestError;
  }
};

export const register = async (
  fields: FieldsType,
  expectation: number,
  undefinedFields: string[] = [],
  overrides: Record<string, unknown> = {},
  initialData?: Record<string, unknown>, // Optionally pass initial data
): Promise<supertest.Response> => {
  // Mock MongoDB session for transactions
  const sessionMock = await mongoose.startSession();
  sessionMock.startTransaction = jest.fn();
  sessionMock.commitTransaction = jest.fn();
  sessionMock.abortTransaction = jest.fn();
  sessionMock.endSession = jest.fn();

  jest.spyOn(mongoose, "startSession").mockResolvedValue(sessionMock);

  const { body, files } = createDataFromFields({ fields, undefinedFields, overrides });

  let request = supertest(app).post(`/api/auth/register`);

  if (Object.keys(files).length > 0) {
    Object.entries({ ...body, ...initialData }).forEach(([key, value]) => {
      if (typeof value === "boolean" || typeof value === "number") {
        request.field(key, value.toString()); // Convert non-string values to strings
      } else {
        request.field(key, value as string);
      }
    });
    Object.entries(files).forEach(([key, fileArray]) => {
      if (fileArray.length > 0) {
        request.attach(key, fileArray[0].path); // Attach only the first file
      }
    });
  } else {
    // 🔥 If NO files, send JSON
    request = request.set("Content-Type", "application/json").send({ ...body, ...initialData });
  }

  try {
    const response = await request.expect(expectation);
    if (Object.keys(files).length > 0) {
      cleanupUploadedFiles(fields, response?.body, files);
    }

    return response;
  } catch (error) {
    const supertestError = error as SupertestError;

    if (supertestError.response?.status !== expectation) {
      if (Object.keys(files).length > 0) {
        cleanupUploadedFiles(fields, body, files);
      }
      console.error("❌ Debug Info:", {
        url: `/api/auth/register`,
        method: "post",
        sentData: { body, files },
      });
    }
    throw supertestError;
  }
};

// Helper for bulk operations
export const createMultipleEntries = async (
  fields: FieldsType,
  mockToken: string,
  moduleName: string,
  count: number,
  expectation: number = CREATED,
  overrides: Record<string, unknown> = {},
): Promise<Record<string, unknown>[]> => {
  const entries: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const response = await createRequest(fields, mockToken, moduleName, expectation, [], overrides);
    entries.push(response.body as Record<string, unknown>);
  }
  return entries;
};

// Helper for GET requests with debugging
export const sendGetRequest = async (mockToken: string, url: string, expectation: number): Promise<supertest.Response> => {
  try {
    const response = await supertest(app).get(url).set("Authorization", mockToken).expect(expectation);

    return response;
  } catch (error) {
    const supertestError = error as SupertestError;

    // Debugging information if the status does not match expectation
    if (supertestError.response?.status !== expectation) {
      console.error("Debug Info:", {
        url: url,
        expectation,
      });
    }

    throw supertestError;
  }
};

export const sendUpdateRequest = async (
  fields: FieldsType,
  mockToken: string,
  moduleName: string,
  moduleId: string,
  undefinedFields: string[] = [],
  overrides: Record<string, unknown> = {},
  expectation: number,
): Promise<supertest.Response> => {
  // ✅ Generate mock data dynamically
  const { body, files } = createDataFromFields({ fields, undefinedFields, overrides });

  let request = supertest(app).patch(`/api/${moduleName}`).set("Authorization", mockToken);

  if (Object.keys(files).length > 0) {
    // ✅ Attach JSON body data using `.field()`
    Object.entries({ moduleId, ...body }).forEach(([key, value]) => {
      if (value === null || value === undefined) return; // Skip null/undefined values

      if (typeof value === "boolean" || typeof value === "number") {
        request.field(key, String(value)); // ✅ Safe conversion
      } else if (typeof value === "string") {
        request.field(key, value);
      } else {
        request.field(key, JSON.stringify(value)); // ✅ Fallback for objects/arrays
      }
    });
    Object.entries(files).forEach(([key, fileArray]) => {
      if (fileArray.length > 0) {
        request.attach(key, fileArray[0].path); // Attach only the first file
      }
    });
  } else {
    // 🔥 If NO files, send JSON
    request = request.set("Content-Type", "application/json").send({ moduleId, ...body });
  }
  try {
    const response = await request.expect(expectation);
    if (Object.keys(files).length > 0) {
      cleanupUploadedFiles(fields, response?.body, files);
    }

    return response;
  } catch (error) {
    const supertestError = error as SupertestError;

    if (supertestError.response?.status !== expectation) {
      if (Object.keys(files).length > 0) {
        cleanupUploadedFiles(fields, body, files);
      }
      console.error("❌ Debug Info:", {
        url: `/api/${moduleName}`,
        method: "patch",
        sentData: { moduleId, body, files },
        expectation,
      });
    }

    throw supertestError;
  }
};

export const sendDeleteRequest = async (mockToken: string, moduleName: string, moduleId: string, expectation: number): Promise<supertest.Response> => {
  // Send the update request with generated data
  return await supertest(app).delete(`/api/${moduleName}`).set("Authorization", mockToken).send({ moduleId: moduleId }).expect(expectation);
};

// Helper for DELETE requests
export const sendDeleteBulkRequest = async (mockToken: string, moduleName: string, moduleIds: unknown[], expectation: number): Promise<supertest.Response> => {
  return await supertest(app).delete(`/api/${moduleName}/bulk`).set("Authorization", mockToken).send({ moduleIds }).expect(expectation);
};

export async function registerFlow(overridesData: any) {
  const response = await register(fields, CREATED, [], { ...overridesData });
  return response;
}

export async function verifyEmailFlow(overridesData: any) {
  const moduleUrl = "auth";
  const post = await registerFlow(overridesData);
  await supertest(app).post(`/api/${moduleUrl}/email/verify`).send({ email: post?.body?.email }).expect(OK);
  const mockTokenShort2 = generateMockTokenRandom(post?.body?._id, post?.body?.email, post?.body?.name, true);
  const response = await supertest(app).patch(`/api/${moduleUrl}/email`).set("Authorization", mockTokenShort2).expect(OK);
  return response;
}

export async function loginFlow(overridesData: any) {
  const moduleUrl = "auth";
  const res = await verifyEmailFlow(overridesData);
  const response = await loginRequest(moduleUrl, { email: res?.body?.email, password: overridesData?.password }, CREATED);
  return response;
}

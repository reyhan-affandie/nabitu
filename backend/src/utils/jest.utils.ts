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
  const exp = iat + 60 * 60 * 24 * 7; // iat + 7 days

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

// Dynamically create mock data
export const createDataFromFields = ({ fields, undefinedFields = [], overrides = {} }: CreateDataFromFieldsParams): Record<string, unknown> => {
  return Object.keys(fields).reduce((acc: Record<string, unknown>, key: string) => {
    const maxLength = fields[key]?.maxLength || 10; // Default maxLength to 10 if not provided

    if (undefinedFields.includes(key)) {
      return acc;
    }

    if (overrides[key] !== undefined) {
      acc[key] = overrides[key];
      return acc;
    }

    if (key.endsWith("Date")) {
      acc[key] = Date.now(); // ✅ Assign Date.now() for fields with "Date" suffix
    } else if (fields[key].type === mongoose.Schema.Types.ObjectId) {
      acc[key] = new mongoose.Types.ObjectId().toString();
    } else if (fields[key].regex === regexEmail) {
      acc[key] = generateRandomString(10, false).toLowerCase() + "@mail.com";
    } else if (fields[key].regex === regexCountry) {
      acc[key] = generateRandomString(2, true).toUpperCase();
    } else if (fields[key].regex === regexPhone) {
      acc[key] = "+" + generateRandomNumber(10);
    } else if (fields[key].regex === regexPassword) {
      acc[key] = generateRandomString(10, false) + generateRandomNumber(10).toString();
    } else if (fields[key].isImage === true) {
      acc[key] = generateRandomString(10, false).toLowerCase() + ".jpg";
    } else if (fields[key].isFile === true) {
      acc[key] = generateRandomString(10, false).toLowerCase() + ".pdf";
    } else if (fields[key].regex === regexString) {
      acc[key] = generateRandomString(maxLength, false);
    } else if (fields[key].regex === regexNumber) {
      acc[key] = generateRandomNumber(maxLength);
    } else if (fields[key].regex === regexBoolean) {
      acc[key] = Math.random() < 0.5;
    } else {
      acc[key] = key; // Default case for other field types
    }
    return acc;
  }, {});
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

export const createRequest = async (
  fields: FieldsType,
  mockToken: string,
  moduleName: string,
  expectation: number,
  undefinedFields: string[] = [],
  overrides: Record<string, unknown> = {},
  initialData?: Record<string, unknown>, // Optionally pass initial data
): Promise<supertest.Response> => {
  const data = {
    ...createDataFromFields({ fields, undefinedFields, overrides }),
    ...initialData,
  };
  try {
    const response = await supertest(app).post(`/api/${moduleName}`).set("Authorization", mockToken).send(data).expect(expectation);

    /*console.debug("Response received:", {
      status: response.status,
      body: response.body,
    });*/
    return response;
  } catch (error) {
    const supertestError = error as SupertestError;

    if (supertestError.response?.status !== expectation) {
      console.error("Debug Info:", {
        url: `/api/${moduleName}`,
        method: "post",
        sentData: data,
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
  const sessionMock = await mongoose.startSession();
  sessionMock.startTransaction = jest.fn();
  sessionMock.commitTransaction = jest.fn();
  sessionMock.abortTransaction = jest.fn();
  sessionMock.endSession = jest.fn();

  jest.spyOn(mongoose, "startSession").mockResolvedValue(sessionMock);

  const data = {
    ...createDataFromFields({ fields, undefinedFields, overrides }),
    ...initialData,
  };
  try {
    const response = await supertest(app).post(`/api/auth/register`).send(data).expect(expectation);

    /*console.debug("Response received:", {
      status: response.status,
      body: response.body,
    });*/
    return response;
  } catch (error) {
    const supertestError = error as SupertestError;

    if (supertestError.response?.status !== expectation) {
      console.error("Debug Info:", {
        url: `/api/auth/register`,
        sentData: data,
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

    /*console.debug("Response received:", {
      status: response.status,
      body: response.body,
    });*/

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
  // Generate mock data dynamically from fields
  const data = createDataFromFields({ fields, undefinedFields, overrides });
  try {
    // Send the update request with generated data
    const response = await supertest(app)
      .patch(`/api/${moduleName}`)
      .set("Authorization", mockToken)
      .send({ moduleId, ...data }) // Include moduleId in the request body
      .expect(expectation);

    /*console.debug("Response received:", {
      status: response.status,
      body: response.body,
    });*/
    return response;
  } catch (error) {
    const supertestError = error as SupertestError;

    // Debugging information if the status does not match expectation
    if (supertestError.response?.status !== expectation) {
      console.error("Debug Info:", {
        url: `/api/${moduleName}`,
        method: "patch",
        sentData: { moduleId, ...data },
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

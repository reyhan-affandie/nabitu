import supertest from "supertest";
import app from "../src/app";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "../src/constants/http";
import {
  generateRandomEmail,
  createRequest,
  sendDeleteRequest,
  sendGetRequest,
  createMultipleEntries,
  sendDeleteBulkRequest,
  generateMockTokenRandom,
  sendUpdateRequest,
  verifyEmailFlow,
  generateRandomString,
} from "../src/utils/jest.utils";
import { fields } from "../src/models/users.model";
import mongoose from "mongoose";

const moduleName = "users";
const parentField = false;
const parentId = new mongoose.Types.ObjectId().toString();
const testTitle = moduleName.toUpperCase();
const invalidId = "123";
const randomId = new mongoose.Types.ObjectId().toString();
const generateId = new mongoose.Types.ObjectId().toString();
let mockToken: string = "";
const email = generateRandomEmail(20);
const name = generateRandomString(20, false);
const password = "Test@1234";
const overridesData = {
  password,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let verifyEmail: any;
let overrides: { [key: string]: string | boolean | number };
beforeEach(async () => {
  verifyEmail = await verifyEmailFlow(overridesData);
  overrides = { parent: verifyEmail?.body?.parent };
  mockToken = generateMockTokenRandom(generateId, email, name, false);
});

describe(`${moduleName} Controller UNIT TESTS`, () => {
  it(`${testTitle} CREATE - ${OK}:OK`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
  });

  it(`${testTitle} READ - ${OK}:OK`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    const queryParams = new URLSearchParams({
      ...(parentField ? { [parentField]: parentId } : {}),
      page: "1",
      limit: "limit",
      search: "valid",
      sort: "updatedAt",
      order: "1",
    }).toString();
    await sendGetRequest(mockToken, `/api/${moduleName}?${queryParams}`, OK);
  });

  it(`${testTitle} READ ONE - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendGetRequest(mockToken, `/api/${moduleName}/${post.body._id}`, OK);
  });

  it(`${testTitle} READ ONE - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendGetRequest(mockToken, `/api/${moduleName}/${invalidId}`, BAD_REQUEST);
  });

  it(`${testTitle} READ ONE - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await supertest(app).get(`/api/${moduleName}/${randomId}`).set("Authorization", mockToken).expect(NOT_FOUND);
  });

  it(`${testTitle} UPDATE - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendUpdateRequest(fields, mockToken, moduleName, post.body._id, [], {}, OK);
  });

  it(`${testTitle} UPDATE - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendUpdateRequest(fields, mockToken, moduleName, randomId, [], overrides, NOT_FOUND);
  });

  it(`${testTitle} DELETE - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendDeleteRequest(mockToken, moduleName, post.body._id, OK);
  });

  it(`${testTitle} DELETE - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendDeleteRequest(mockToken, moduleName, invalidId, BAD_REQUEST);
  });

  it(`${testTitle} DELETE - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendDeleteRequest(mockToken, moduleName, randomId, NOT_FOUND);
  });

  it(`${testTitle} DELETE BULK - ${OK}:OK`, async () => {
    const entries = await createMultipleEntries(fields, mockToken, moduleName, 2, CREATED, overrides);
    const ids = entries.map((entry) => entry._id);
    await sendDeleteBulkRequest(mockToken, moduleName, ids, OK);
  });

  it(`${testTitle} DELETE BULK - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await sendDeleteBulkRequest(mockToken, moduleName, [], BAD_REQUEST);
  });

  it(`${testTitle} DELETE BULK - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await sendDeleteBulkRequest(mockToken, moduleName, [invalidId], BAD_REQUEST);
  });

  it(`${testTitle} DELETE BULK - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await sendDeleteBulkRequest(mockToken, moduleName, [randomId], NOT_FOUND);
  });
});

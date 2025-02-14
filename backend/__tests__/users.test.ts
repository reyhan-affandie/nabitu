import supertest from "supertest";
import app from "../src/app";
import { BAD_REQUEST, CREATED, NOT_FOUND, OK, UNAUTHORIZED } from "../src/constants/http";
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
  const overridesUser = {
    password,
    access: 2,
    parent: "",
  };
  verifyEmail = await verifyEmailFlow(overridesData, overridesUser, password);
  overrides = { parent: verifyEmail?.body?.parent };
  mockToken = generateMockTokenRandom(generateId, email, name, false);
});

describe(`${moduleName} Controller UNIT TESTS`, () => {
  it(`${testTitle} CREATE ${name} - ${OK}:OK`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
  });

  it(`${testTitle} CREATE ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    await createMultipleEntries(fields, mockToken[2], moduleName, 2, CREATED, overrides);
    await createRequest(fields, mockToken, moduleName, UNAUTHORIZED, [], overrides);
  });

  it(`${testTitle} CREATE ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    overrides.access = 1;
    await createRequest(fields, mockToken, moduleName, UNAUTHORIZED, [], overrides);
  });

  it(`${testTitle} READ ${name} - ${OK}:OK`, async () => {
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

  it(`${testTitle} READ ONE ${name} - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendGetRequest(mockToken, `/api/${moduleName}/${post.body._id}`, OK);
  });

  it(`${testTitle} READ ONE ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendGetRequest(mockToken, `/api/${moduleName}/${invalidId}`, BAD_REQUEST);
  });

  it(`${testTitle} READ ONE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await supertest(app).get(`/api/${moduleName}/${randomId}`).set("Authorization", mockToken).expect(NOT_FOUND);
  });

  it(`${testTitle} UPDATE ${name} - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendUpdateRequest(fields, mockToken, moduleName, post.body._id, [], {}, OK);
  });

  it(`${testTitle} UPDATE ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    overrides.access = 1;
    const post = await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendUpdateRequest(fields, mockToken, moduleName, post.body._id, [], overrides, UNAUTHORIZED);
  });

  it(`${testTitle} UPDATE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendUpdateRequest(fields, mockToken, moduleName, randomId, [], overrides, NOT_FOUND);
  });

  it(`${testTitle} UPDATE STATUS ${name} - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendUpdateRequest(fields, mockToken, `${moduleName}/status`, post.body._id, [], {}, OK);
  });

  it(`${testTitle} UPDATE STATUS ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED, [], overrides);
    await sendUpdateRequest(fields, mockToken, `${moduleName}/status`, randomId, [], {}, NOT_FOUND);
  });

  it(`${testTitle} DELETE ${name} - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken[2], moduleName, CREATED, [], overrides);
    await sendDeleteRequest(mockToken, moduleName, post.body._id, OK);
  });

  it(`${testTitle} DELETE ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await createRequest(fields, mockToken[2], moduleName, CREATED, [], overrides);
    await sendDeleteRequest(mockToken, moduleName, invalidId, BAD_REQUEST);
  });

  it(`${testTitle} DELETE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken[2], moduleName, CREATED, [], overrides);
    await sendDeleteRequest(mockToken, moduleName, randomId, NOT_FOUND);
  });

  it(`${testTitle} DELETE BULK ${name} - ${OK}:OK`, async () => {
    const entries = await createMultipleEntries(fields, mockToken[2], moduleName, 2, CREATED, overrides);
    const ids = entries.map((entry) => entry._id);
    await sendDeleteBulkRequest(mockToken, moduleName, ids, OK);
  });

  it(`${testTitle} DELETE BULK ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await sendDeleteBulkRequest(mockToken, moduleName, [], BAD_REQUEST);
  });

  it(`${testTitle} DELETE BULK ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await sendDeleteBulkRequest(mockToken, moduleName, [invalidId], BAD_REQUEST);
  });

  it(`${testTitle} DELETE BULK ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await sendDeleteBulkRequest(mockToken, moduleName, [randomId], NOT_FOUND);
  });
});

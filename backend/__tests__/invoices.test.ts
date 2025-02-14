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
  loginFlow,
  generateRandomString,
} from "../src/utils/jest.utils";
import { fields } from "../src/models/invoices.model";
import mongoose from "mongoose";

const moduleName = "invoices";
const parentField = false;
const parentId = new mongoose.Types.ObjectId().toString();
const testTitle = moduleName.toUpperCase();
const invalidId = "123";
const randomId = new mongoose.Types.ObjectId().toString();
const generateId = new mongoose.Types.ObjectId().toString();
let mockToken: string = "";
const email = generateRandomEmail(20);
const name = generateRandomString(20, false);
beforeAll(() => {
  mockToken = generateMockTokenRandom(generateId, email, name, false);
});

describe(`${moduleName} Controller UNIT TESTS`, () => {
  it(`${testTitle} CREATE ${name} - ${OK}:OK`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED);
  });

  it(`${testTitle} READ ${name} - ${OK}:OK`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED);
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
    const post = await createRequest(fields, mockToken, moduleName, CREATED);
    await sendGetRequest(mockToken, `/api/${moduleName}/${post.body._id}`, OK);
  });

  it(`${testTitle} READ ONE ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED);
    await sendGetRequest(mockToken, `/api/${moduleName}/${invalidId}`, BAD_REQUEST);
  });

  it(`${testTitle} READ ONE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED);
    await supertest(app).get(`/api/${moduleName}/${randomId}`).set("Authorization", mockToken).expect(NOT_FOUND);
  });

  it(`${testTitle} UPDATE ${name} - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken, moduleName, CREATED);
    await sendUpdateRequest(fields, mockToken, moduleName, post.body._id, [], {}, OK);
  });

  it(`${testTitle} UPDATE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED);
    await sendUpdateRequest(fields, mockToken, moduleName, randomId, [], {}, NOT_FOUND);
  });

  it(`${testTitle} UPDATE STATUS ${name} - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken, moduleName, CREATED);
    await sendUpdateRequest(fields, mockToken, `${moduleName}/status`, post.body._id, [], {}, OK);
  });

  it(`${testTitle} UPDATE STATUS ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED);
    await sendUpdateRequest(fields, mockToken, `${moduleName}/status`, randomId, [], {}, NOT_FOUND);
  });

  it(`${testTitle} SEND VERIFY EMAIL ${name} - ${OK}:OK`, async () => {
    const reg = await createRequest(fields, mockToken, moduleName, CREATED);
    await supertest(app).post(`/api/${moduleName}/email/verify`).set("Authorization", mockToken).send({ invoiceEmail: reg?.body?.invoiceEmail }).expect(OK);
  });

  it(`${testTitle} SEND VERIFY EMAIL ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await createRequest(fields, mockToken, moduleName, CREATED);
    await supertest(app).post(`/api/${moduleName}/email/verify`).set("Authorization", mockToken).send().expect(BAD_REQUEST);
  });
  const password = "Test@1234";
  const overridesData = {
    password,
    roleName: "CEO",
  };
  const overridesUser = {
    password,
    access: 2,
    parent: "",
  };
  it(`${testTitle} SEND VERIFY EMAIL ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const login = await loginFlow(overridesData, overridesUser, password);
    const reg = await createRequest(fields, `Bearer ${login?.body?.token}`, moduleName, CREATED);
    await supertest(app)
      .post(`/api/${moduleName}/email/verify`)
      .set("Authorization", `Bearer ${login?.body?.token}`)
      .send({ invoiceEmail: reg?.body?.invoiceEmail })
      .expect(OK);
    const verifyEmail = await supertest(app)
      .patch(`/api/${moduleName}/email`)
      .set("Authorization", `Bearer ${login?.body?.token}`)
      .send({ invoice: reg?.body?._id })
      .expect(OK);
    await supertest(app)
      .post(`/api/${moduleName}/email/verify`)
      .set("Authorization", `Bearer ${verifyEmail?.body?.token}`)
      .send({ invoiceEmail: reg?.body?.invoiceEmail })
      .expect(UNAUTHORIZED);
  });

  it(`${testTitle} VERIFY EMAIL ${name} - ${OK}:OK`, async () => {
    const login = await loginFlow(overridesData, overridesUser, password);
    const reg = await createRequest(fields, `Bearer ${login?.body?.token}`, moduleName, CREATED);
    await supertest(app)
      .post(`/api/${moduleName}/email/verify`)
      .set("Authorization", `Bearer ${login?.body?.token}`)
      .send({ invoiceEmail: reg?.body?.invoiceEmail })
      .expect(OK);
    await supertest(app).patch(`/api/${moduleName}/email`).set("Authorization", `Bearer ${login?.body?.token}`).send({ invoice: reg?.body?._id }).expect(OK);
  });

  it(`${testTitle} VERIFY EMAIL ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const reg = await createRequest(fields, mockToken, moduleName, CREATED);
    await supertest(app).post(`/api/${moduleName}/email/verify`).set("Authorization", mockToken).send({ invoiceEmail: reg?.body?.invoiceEmail }).expect(OK);
    await supertest(app).patch(`/api/${moduleName}/email`).set("Authorization", "InvalidToken").send({ invoice: reg?.body?._id }).expect(UNAUTHORIZED);
  });

  it(`${testTitle} DELETE ${name} - ${OK}:OK`, async () => {
    const post = await createRequest(fields, mockToken[2], moduleName, CREATED);
    await sendDeleteRequest(mockToken, moduleName, post.body._id, OK);
  });

  it(`${testTitle} DELETE ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await createRequest(fields, mockToken[2], moduleName, CREATED);
    await sendDeleteRequest(mockToken, moduleName, invalidId, BAD_REQUEST);
  });

  it(`${testTitle} DELETE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
    await createRequest(fields, mockToken[2], moduleName, CREATED);
    await sendDeleteRequest(mockToken, moduleName, randomId, NOT_FOUND);
  });

  it(`${testTitle} DELETE BULK ${name} - ${OK}:OK`, async () => {
    const entries = await createMultipleEntries(fields, mockToken[2], moduleName, 2);
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

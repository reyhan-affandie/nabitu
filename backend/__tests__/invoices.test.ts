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
} from "../src/utils/jest.utils";
import { fields } from "../src/models/invoices.model";
import mongoose from "mongoose";

const moduleName = "invoices";
const parentField = false;
const parentId = new mongoose.Types.ObjectId().toString();
const testTitle = moduleName.toUpperCase();
const invalidId = "123";
const randomId = new mongoose.Types.ObjectId().toString();
const roles = [
  { x: 0, name: "WORKLIFE OWNER", admin: true, access: 1 },
  { x: 1, name: "WORKLIFE ADMIN", admin: true, access: 2 },
  { x: 2, name: "CUSTOMER OWNER", admin: false, access: 1 },
  { x: 3, name: "CUSTOMER ADMINISTRATOR", admin: false, access: 2 },
  { x: 4, name: "CUSTOMER SUPERVISOR", admin: false, access: 3 },
  { x: 5, name: "CUSTOMER EMPLOYEE", admin: false, access: 4 },
];
const generateId = new mongoose.Types.ObjectId().toString();
const generateParent = new mongoose.Types.ObjectId().toString();
const mockToken: Array<string> = [];
const email = generateRandomEmail(20);
beforeAll(() => {
  roles.forEach(({ x, name, admin, access }) => {
    let parent = generateParent;
    if (x <= 2) {
      parent = generateId;
    }
    mockToken[x] = generateMockTokenRandom(generateId, parent, admin, access, email, name, false);
  });
});

describe(`${moduleName} Controller UNIT TESTS`, () => {
  roles.forEach(({ x, name, admin, access }) => {
    it(`${testTitle} CREATE ${name} - ${OK}:OK`, async () => {
      if (admin === false && access <= 2) {
        await createRequest(access, fields, mockToken[x], moduleName, CREATED);
      } else {
        await createRequest(access, fields, mockToken[x], moduleName, UNAUTHORIZED);
      }
    });

    it(`${testTitle} READ ${name} - ${OK}:OK`, async () => {
      if (access <= 2) {
        if (x <= 1) {
          await createRequest(access, fields, mockToken[2], moduleName, CREATED);
        } else {
          await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        }
        const queryParams = new URLSearchParams({
          ...(parentField ? { [parentField]: parentId } : {}),
          page: "1",
          limit: "limit",
          search: "valid",
          sort: "updatedAt",
          order: "1",
        }).toString();
        await sendGetRequest(mockToken[x], `/api/${moduleName}?${queryParams}`, OK);
      } else {
        const queryParams = new URLSearchParams({
          ...(parentField ? { [parentField]: parentId } : {}),
          page: "page",
          limit: "limit",
          search: "valid",
          sort: "updatedAt",
          order: "1",
        }).toString();
        await sendGetRequest(mockToken[x], `/api/${moduleName}?${queryParams}`, UNAUTHORIZED);
      }
    });

    it(`${testTitle} READ ONE ${name} - ${OK}:OK`, async () => {
      if (access <= 2) {
        let post;
        if (x <= 1) {
          post = await createRequest(access, fields, mockToken[2], moduleName, CREATED);
        } else {
          post = await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        }
        await sendGetRequest(mockToken[x], `/api/${moduleName}/${post.body._id}`, OK);
      } else {
        await sendGetRequest(mockToken[x], `/api/${moduleName}/${randomId}`, NOT_FOUND);
      }
    });

    it(`${testTitle} READ ONE ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
      if (access <= 2) {
        if (x <= 1) {
          await createRequest(access, fields, mockToken[2], moduleName, CREATED);
        } else {
          await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        }
        await sendGetRequest(mockToken[x], `/api/${moduleName}/${invalidId}`, BAD_REQUEST);
      } else {
        await sendGetRequest(mockToken[x], `/api/${moduleName}/${invalidId}`, BAD_REQUEST);
      }
    });

    it(`${testTitle} READ ONE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (access <= 2) {
        if (x <= 1) {
          await createRequest(access, fields, mockToken[2], moduleName, CREATED);
        } else {
          await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        }
        await supertest(app).get(`/api/${moduleName}/${randomId}`).set("Authorization", mockToken[x]).expect(NOT_FOUND);
      } else {
        await supertest(app).get(`/api/${moduleName}/${randomId}`).set("Authorization", mockToken[x]).expect(NOT_FOUND);
      }
    });

    it(`${testTitle} UPDATE ${name} - ${OK}:OK`, async () => {
      if (admin === false && access <= 2) {
        const post = await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, post.body._id, [], {}, OK);
      } else {
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, randomId, [], {}, UNAUTHORIZED);
      }
    });

    it(`${testTitle} UPDATE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (admin === false && access <= 2) {
        await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, randomId, [], {}, NOT_FOUND);
      } else {
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, randomId, [], {}, UNAUTHORIZED);
      }
    });

    it(`${testTitle} UPDATE STATUS ${name} - ${OK}:OK`, async () => {
      if (admin === false && access <= 2) {
        const post = await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, post.body._id, [], {}, OK);
      } else {
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, randomId, [], {}, UNAUTHORIZED);
      }
    });

    it(`${testTitle} UPDATE STATUS ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (admin === false && access <= 2) {
        await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, randomId, [], {}, NOT_FOUND);
      } else {
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, randomId, [], {}, UNAUTHORIZED);
      }
    });

    it(`${testTitle} SEND VERIFY EMAIL ${name} - ${OK}:OK`, async () => {
      if (admin === false && access <= 2) {
        const reg = await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        await supertest(app)
          .post(`/api/${moduleName}/email/verify`)
          .set("Authorization", mockToken[x])
          .send({ invoiceEmail: reg?.body?.invoiceEmail })
          .expect(OK);
      }
    });

    it(`${testTitle} SEND VERIFY EMAIL ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
      if (admin === false && access <= 2) {
        await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        await supertest(app).post(`/api/${moduleName}/email/verify`).set("Authorization", mockToken[x]).send().expect(BAD_REQUEST);
      }
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
      const login = await loginFlow(admin, access, overridesData, overridesUser, password);
      if (admin === false && access <= 2) {
        const reg = await createRequest(access, fields, `Bearer ${login?.body?.token}`, moduleName, CREATED);
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
      }
    });

    it(`${testTitle} VERIFY EMAIL ${name} - ${OK}:OK`, async () => {
      const login = await loginFlow(admin, access, overridesData, overridesUser, password);
      if (admin === false && access <= 2) {
        const reg = await createRequest(access, fields, `Bearer ${login?.body?.token}`, moduleName, CREATED);
        await supertest(app)
          .post(`/api/${moduleName}/email/verify`)
          .set("Authorization", `Bearer ${login?.body?.token}`)
          .send({ invoiceEmail: reg?.body?.invoiceEmail })
          .expect(OK);
        await supertest(app)
          .patch(`/api/${moduleName}/email`)
          .set("Authorization", `Bearer ${login?.body?.token}`)
          .send({ invoice: reg?.body?._id })
          .expect(OK);
      }
    });

    it(`${testTitle} VERIFY EMAIL ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
      if (admin === false && access <= 2) {
        const reg = await createRequest(access, fields, mockToken[x], moduleName, CREATED);
        await supertest(app)
          .post(`/api/${moduleName}/email/verify`)
          .set("Authorization", mockToken[x])
          .send({ invoiceEmail: reg?.body?.invoiceEmail })
          .expect(OK);
        await supertest(app).patch(`/api/${moduleName}/email`).set("Authorization", "InvalidToken").send({ invoice: reg?.body?._id }).expect(UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE ${name} - ${OK}:OK`, async () => {
      if (admin === true && access === 1) {
        const post = await createRequest(access, fields, mockToken[2], moduleName, CREATED);
        await sendDeleteRequest(mockToken[x], moduleName, post.body._id, OK);
      } else {
        await sendDeleteRequest(mockToken[x], moduleName, randomId, UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
      if (admin === true && access === 1) {
        await createRequest(access, fields, mockToken[2], moduleName, CREATED);
        await sendDeleteRequest(mockToken[x], moduleName, invalidId, BAD_REQUEST);
      } else {
        await sendDeleteRequest(mockToken[x], moduleName, invalidId, UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (admin === true && access === 1) {
        await createRequest(access, fields, mockToken[2], moduleName, CREATED);
        await sendDeleteRequest(mockToken[x], moduleName, randomId, NOT_FOUND);
      } else {
        await sendDeleteRequest(mockToken[x], moduleName, randomId, UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE BULK ${name} - ${OK}:OK`, async () => {
      if (admin === true && access === 1) {
        const entries = await createMultipleEntries(access, fields, mockToken[2], moduleName, 2);
        const ids = entries.map((entry) => entry._id);
        await sendDeleteBulkRequest(mockToken[x], moduleName, ids, OK);
      } else {
        await sendDeleteBulkRequest(mockToken[x], moduleName, [randomId], UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE BULK ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
      if (admin === true && access === 1) {
        await sendDeleteBulkRequest(mockToken[x], moduleName, [], BAD_REQUEST);
      } else {
        await sendDeleteBulkRequest(mockToken[x], moduleName, [randomId], UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE BULK ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
      if (admin === true && access === 1) {
        await sendDeleteBulkRequest(mockToken[x], moduleName, [invalidId], BAD_REQUEST);
      } else {
        await sendDeleteBulkRequest(mockToken[x], moduleName, [invalidId], UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE BULK ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (admin === true && access === 1) {
        await sendDeleteBulkRequest(mockToken[x], moduleName, [randomId], NOT_FOUND);
      } else {
        await sendDeleteBulkRequest(mockToken[x], moduleName, [randomId], UNAUTHORIZED);
      }
    });
  });
});

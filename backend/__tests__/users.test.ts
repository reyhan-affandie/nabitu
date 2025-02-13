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
} from "../src/utils/jest.utils";
import { fields } from "../src/models/users.model";
import mongoose from "mongoose";

const moduleName = "users";
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
const mockToken: Array<string> = [];
const email = generateRandomEmail(20);
const password = "Test@1234";
const overridesData = {
  password,
  roleName: "CEO",
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
  verifyEmail = await verifyEmailFlow(false, 1, overridesData, overridesUser, password);
  overrides = { parent: verifyEmail?.body?.parent };
  for (const { x, name, admin, access } of roles) {
    mockToken[x] = generateMockTokenRandom(generateId, verifyEmail?.body?.parent, admin, access, email, name, false);
  }
});

describe(`${moduleName} Controller UNIT TESTS`, () => {
  roles.forEach(({ x, name, admin, access }) => {
    it(`${testTitle} CREATE ${name} - ${OK}:OK`, async () => {
      if (admin === false && access <= 2) {
        await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
      } else {
        await createRequest(access, fields, mockToken[x], moduleName, UNAUTHORIZED, [], overrides);
      }
    });

    it(`${testTitle} CREATE ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
      if (admin === false && access <= 2) {
        await createMultipleEntries(access, fields, mockToken[2], moduleName, 2, CREATED, overrides);
        await createRequest(access, fields, mockToken[x], moduleName, UNAUTHORIZED, [], overrides);
      } else {
        await createRequest(access, fields, mockToken[x], moduleName, UNAUTHORIZED, [], overrides);
      }
    });

    it(`${testTitle} CREATE ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
      if (admin === false && access === 2) {
        overrides.access = 1;
        await createRequest(access, fields, mockToken[x], moduleName, UNAUTHORIZED, [], overrides);
      }
    });

    it(`${testTitle} READ ${name} - ${OK}:OK`, async () => {
      if (access <= 2) {
        if (x <= 1 || admin === true) {
          await createRequest(access, fields, mockToken[2], moduleName, CREATED, [], overrides);
        } else {
          await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
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
        if (x <= 1 || admin === true) {
          post = await createRequest(access, fields, mockToken[2], moduleName, CREATED, [], overrides);
        } else {
          post = await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
        }
        await sendGetRequest(mockToken[x], `/api/${moduleName}/${post.body._id}`, OK);
      } else {
        await sendGetRequest(mockToken[x], `/api/${moduleName}/${randomId}`, NOT_FOUND);
      }
    });

    it(`${testTitle} READ ONE ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
      if (access <= 2) {
        if (x <= 1 || admin === true) {
          await createRequest(access, fields, mockToken[2], moduleName, CREATED, [], overrides);
        } else {
          await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
        }
        await sendGetRequest(mockToken[x], `/api/${moduleName}/${invalidId}`, BAD_REQUEST);
      } else {
        await sendGetRequest(mockToken[x], `/api/${moduleName}/${invalidId}`, BAD_REQUEST);
      }
    });

    it(`${testTitle} READ ONE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (access <= 2) {
        if (x <= 1 || admin === true) {
          await createRequest(access, fields, mockToken[2], moduleName, CREATED, [], overrides);
        } else {
          await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
        }
        await supertest(app).get(`/api/${moduleName}/${randomId}`).set("Authorization", mockToken[x]).expect(NOT_FOUND);
      } else {
        await supertest(app).get(`/api/${moduleName}/${randomId}`).set("Authorization", mockToken[x]).expect(NOT_FOUND);
      }
    });

    it(`${testTitle} UPDATE ${name} - ${OK}:OK`, async () => {
      if (admin === false && access <= 2) {
        const post = await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, post.body._id, [], {}, OK);
      } else {
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, randomId, [], {}, UNAUTHORIZED);
      }
    });

    it(`${testTitle} UPDATE ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
      if (admin === false && access === 2) {
        overrides.access = 1;
        const post = await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, post.body._id, [], overrides, UNAUTHORIZED);
      }
    });

    it(`${testTitle} UPDATE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (admin === false && access <= 2) {
        await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
        overrides.access = access;
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, randomId, [], overrides, NOT_FOUND);
      } else {
        await sendUpdateRequest(access, fields, mockToken[x], moduleName, randomId, [], {}, UNAUTHORIZED);
      }
    });

    it(`${testTitle} UPDATE STATUS ${name} - ${OK}:OK`, async () => {
      if (admin === false && access <= 2) {
        const post = await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, post.body._id, [], {}, OK);
      } else {
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, randomId, [], {}, UNAUTHORIZED);
      }
    });

    /*it(`${testTitle} UPDATE STATUS ${name} - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
      if (admin === false && access === 2) {
        const overrides = { access: 1 };
        const post = await createRequest(1, fields, mockToken[2], moduleName, CREATED, [], overrides);
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, post.body._id, [], overrides, UNAUTHORIZED);
      }
    });*/

    it(`${testTitle} UPDATE STATUS ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (admin === false && access <= 2) {
        await createRequest(access, fields, mockToken[x], moduleName, CREATED, [], overrides);
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, randomId, [], {}, NOT_FOUND);
      } else {
        await sendUpdateRequest(access, fields, mockToken[x], `${moduleName}/status`, randomId, [], {}, UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE ${name} - ${OK}:OK`, async () => {
      if (admin === true && access === 1) {
        const post = await createRequest(access, fields, mockToken[2], moduleName, CREATED, [], overrides);
        await sendDeleteRequest(mockToken[x], moduleName, post.body._id, OK);
      } else {
        await sendDeleteRequest(mockToken[x], moduleName, randomId, UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE ${name} - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
      if (admin === true && access === 1) {
        await createRequest(access, fields, mockToken[2], moduleName, CREATED, [], overrides);
        await sendDeleteRequest(mockToken[x], moduleName, invalidId, BAD_REQUEST);
      } else {
        await sendDeleteRequest(mockToken[x], moduleName, invalidId, UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE ${name} - ${NOT_FOUND}:NOT_FOUND`, async () => {
      if (admin === true && access === 1) {
        await createRequest(access, fields, mockToken[2], moduleName, CREATED, [], overrides);
        await sendDeleteRequest(mockToken[x], moduleName, randomId, NOT_FOUND);
      } else {
        await sendDeleteRequest(mockToken[x], moduleName, randomId, UNAUTHORIZED);
      }
    });

    it(`${testTitle} DELETE BULK ${name} - ${OK}:OK`, async () => {
      if (admin === true && access === 1) {
        const entries = await createMultipleEntries(access, fields, mockToken[2], moduleName, 2, CREATED, overrides);
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

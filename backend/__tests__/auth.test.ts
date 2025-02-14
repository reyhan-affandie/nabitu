import mongoose from "mongoose";
import supertest from "supertest";
import app from "../src/app";
import { CREATED, BAD_REQUEST, OK, UNAUTHORIZED, NOT_FOUND } from "../src/constants/http";
import { fields } from "../src/models/users.model";
import {
  register,
  loginRequest,
  generateMockTokenRandom,
  loginFlow,
  generateRandomEmail,
  verifyEmailFlow,
  registerFlow,
  sendGetRequest,
} from "../src/utils/jest.utils";

const moduleName = "auth";
const testTitle = moduleName.toUpperCase();

describe(`${moduleName} Controller UNIT TESTS`, () => {
  const email = generateRandomEmail(20);
  const password = "Test@1234";
  const invalidEmail = "testinvalid@email.com";
  const invalidCredential = {
    email: email,
    password: "testPassword",
  };
  const invalidCredentialBoth = {
    email: "testinvalid@email.com",
    password: "testPassword",
  };
  const overridesData = {
    password,
  };

  it(`${testTitle} REGISTER - ${OK}:OK`, async () => {
    await register(fields, CREATED, [], { ...overridesData });
  });
  it(`${testTitle} REGISTER - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await register(fields, BAD_REQUEST, ["email", "name", "password"], {});
  });
  it(`${testTitle} SEND VERIFY EMAIL - ${OK}:OK`, async () => {
    const reg = await register(fields, CREATED, [], { ...overridesData });
    await supertest(app).post(`/api/${moduleName}/email/verify`).send({ email: reg?.body?.email }).expect(OK);
  });

  it(`${testTitle} SEND VERIFY EMAIL - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    await register(fields, CREATED, [], { ...overridesData });
    await supertest(app).post(`/api/${moduleName}/email/verify`).send().expect(BAD_REQUEST);
  });

  it(`${testTitle} SEND VERIFY EMAIL - ${NOT_FOUND}:NOT_FOUND`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/email/verify`).send({ email: verifyEmail?.body?.email }).expect(NOT_FOUND);
  });

  it(`${testTitle} VERIFY EMAIL - ${OK}:OK`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
  });

  it(`${testTitle} VERIFY EMAIL - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const reg = await registerFlow(overridesData);
    await supertest(app).post(`/api/${moduleName}/email/verify`).send({ email: reg?.body?.email }).expect(OK);
    await supertest(app).patch(`/api/${moduleName}/email`).set("Authorization", "invalidtoken").expect(UNAUTHORIZED);
  });

  it(`${testTitle} VERIFY EMAIL - ${NOT_FOUND}:NOT_FOUND`, async () => {
    const reg = await registerFlow(overridesData);
    await supertest(app).post(`/api/${moduleName}/email/verify`).send({ email: reg?.body?.email }).expect(OK);
    const mockTokenShort2 = generateMockTokenRandom(reg?.body?._id, reg?.body?.email, reg?.body?.name, true);
    const res = await supertest(app).patch(`/api/${moduleName}/email`).set("Authorization", mockTokenShort2).expect(OK);
    await supertest(app).patch(`/api/${moduleName}/email`).set("Authorization", `Bearer ${res?.body?.token}`).expect(NOT_FOUND);
  });

  it(`${testTitle} LOGIN - ${OK}:OK`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
  });
  it(`${testTitle} LOGIN - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    const login = await loginRequest(moduleName, {}, BAD_REQUEST);
    expect(login.body.token).toBeUndefined();
    expect(login.body.status).toBe(BAD_REQUEST);
  });

  it(`${testTitle} LOGIN - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    const login = await loginRequest(moduleName, invalidCredential, UNAUTHORIZED);
    expect(login.body.token).toBeUndefined();
    expect(login.body.status).toBe(UNAUTHORIZED);
  });

  it(`${testTitle} LOGIN - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    const login = await loginRequest(moduleName, invalidCredentialBoth, UNAUTHORIZED);
    expect(login.body.token).toBeUndefined();
    expect(login.body.status).toBe(UNAUTHORIZED);
  });

  it(`${testTitle} SEND FORGOT PASSWORD EMAIL - ${OK}:OK`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/password/verify`).send({ email: verifyEmail?.body?.email }).expect(OK);
  });

  it(`${testTitle} SEND FORGOT PASSWORD EMAIL - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/password/verify`).expect(BAD_REQUEST);
  });

  it(`${testTitle} SEND FORGOT PASSWORD EMAIL - ${NOT_FOUND}:NOT_FOUND`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/password/verify`).send({ email: invalidEmail }).expect(NOT_FOUND);
  });

  it(`${testTitle} FORGOT PASSWORD - ${OK}:OK`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/password/verify`).send({ email: verifyEmail?.body?.email }).expect(OK);
    await supertest(app).patch(`/api/${moduleName}/password/forgot`).set("Authorization", `Bearer ${verifyEmail?.body?.token}`).send({ password }).expect(OK);
  });

  it(`${testTitle} FORGOT PASSWORD - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/password/verify`).send({ email: verifyEmail?.body?.email }).expect(OK);
    await supertest(app).patch(`/api/${moduleName}/password/forgot`).set("Authorization", `Bearer ${verifyEmail?.body?.token}`).expect(BAD_REQUEST);
  });

  it(`${testTitle} FORGOT PASSWORD - ${NOT_FOUND}:NOT_FOUND`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/password/verify`).send({ email: verifyEmail?.body?.email }).expect(OK);
    const mockTokenShort2 = generateMockTokenRandom(new mongoose.Types.ObjectId(), verifyEmail?.body?.email, verifyEmail?.body?.name, true);
    await supertest(app).patch(`/api/${moduleName}/password/forgot`).set("Authorization", mockTokenShort2).send({ password }).expect(NOT_FOUND);
  });

  it(`${testTitle} FORGOT PASSWORD - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/password/verify`).send({ email: verifyEmail?.body?.email }).expect(OK);
    await supertest(app).patch(`/api/${moduleName}/password/forgot`).set("Authorization", `Bearer InvalidToken`).send({ password }).expect(UNAUTHORIZED);
  });

  it(`${testTitle} FORGOT PASSWORD - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const verifyEmail = await verifyEmailFlow(overridesData);
    expect(verifyEmail.body.token).toBeDefined();
    await supertest(app).post(`/api/${moduleName}/password/verify`).send({ email: verifyEmail?.body?.email }).expect(OK);
    await supertest(app).patch(`/api/${moduleName}/password/forgot`).set("Authorization", `Bearer ${verifyEmail?.body?.token}`).send({ password }).expect(OK);
    await supertest(app)
      .patch(`/api/${moduleName}/password/forgot`)
      .set("Authorization", `Bearer ${verifyEmail?.body?.token}`)
      .send({ password })
      .expect(UNAUTHORIZED);
  });

  it(`${testTitle} UPDATE PASSWORD - ${OK}:OK`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await supertest(app)
      .patch(`/api/${moduleName}/password/update`)
      .set("Authorization", `Bearer ${login?.body?.token}`)
      .send({
        email: login?.body?.email,
        oldPassword: password,
        password: "newPassword",
      })
      .expect(OK);
  });

  it(`${testTitle} UPDATE PASSWORD - ${BAD_REQUEST}:BAD_REQUEST`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await supertest(app).patch(`/api/${moduleName}/password/update`).set("Authorization", `Bearer ${login?.body?.token}`).expect(BAD_REQUEST);
  });

  it(`${testTitle} UPDATE PASSWORD - ${NOT_FOUND}:NOT_FOUND`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await supertest(app)
      .patch(`/api/${moduleName}/password/update`)
      .set("Authorization", `Bearer ${login?.body?.token}`)
      .send({
        email: invalidEmail,
        oldPassword: password,
        password: "newPassword",
      })
      .expect(NOT_FOUND);
  });

  it(`${testTitle} UPDATE PASSWORD - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await supertest(app)
      .patch(`/api/${moduleName}/password/update`)
      .set("Authorization", `Bearer ${login?.body?.token}`)
      .send({
        email: login?.body?.email,
        oldPassword: "invalidOldPassword",
        password: "newPassword",
      })
      .expect(UNAUTHORIZED);
  });

  it(`${testTitle} GET AUTH USER - ${OK}:OK`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await sendGetRequest(`Bearer ${login?.body?.token}`, `/api/${moduleName}`, OK);
  });

  it(`${testTitle} GET AUTH USER - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await sendGetRequest(`Bearer InvalidToken`, `/api/${moduleName}`, UNAUTHORIZED);
  });

  it(`${testTitle} GET AUTH USER - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    const mockTokenShort2 = generateMockTokenRandom(new mongoose.Types.ObjectId(), login?.body?.email, login?.body?.name, true);
    await sendGetRequest(mockTokenShort2, `/api/${moduleName}`, UNAUTHORIZED);
  });

  it(`${testTitle} REFRESH TOKEN - ${OK}:OK`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await sendGetRequest(`Bearer ${login?.body?.token}`, `/api/${moduleName}/refresh`, CREATED);
  });

  it(`${testTitle} REFRESH TOKEN - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await sendGetRequest(`Bearer InvalidToken`, `/api/${moduleName}/refresh`, UNAUTHORIZED);
  });

  it(`${testTitle} REFRESH TOKEN - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    const mockTokenShort2 = generateMockTokenRandom(new mongoose.Types.ObjectId(), login?.body?.email, login?.body?.name, true);
    await sendGetRequest(mockTokenShort2, `/api/${moduleName}/refresh`, UNAUTHORIZED);
    await supertest(app).get(`/api/${moduleName}/refresh`).set("Authorization", mockTokenShort2).expect(UNAUTHORIZED);
  });

  it(`${testTitle} LOGOUT - ${OK}:OK`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await sendGetRequest(`Bearer ${login?.body?.token}`, `/api/${moduleName}/logout`, OK);
  });

  it(`${testTitle} LOGOUT - ${UNAUTHORIZED}:UNAUTHORIZED`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    await sendGetRequest(`Bearer InvalidToken`, `/api/${moduleName}/logout`, UNAUTHORIZED);
  });

  it(`${testTitle} LOGOUT - ${NOT_FOUND}:NOT_FOUND`, async () => {
    const login = await loginFlow(overridesData);
    expect(login.body.token).toBeDefined();
    const mockTokenShort2 = generateMockTokenRandom(new mongoose.Types.ObjectId(), login?.body?.user?.email, login?.body?.user?.name, true);
    await sendGetRequest(mockTokenShort2, `/api/${moduleName}/logout`, NOT_FOUND);
  });
});

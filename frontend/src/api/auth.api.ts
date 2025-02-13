"use server";

import { UNAUTHORIZED_RESPONSE } from "@/constants/constants";
import { API_ORIGIN } from "@/constants/env";
import { LoginPayloadType } from "@/lib/types/login.type";
import axios from "axios";
import { cookies } from "next/headers";
import { engineGet } from "@/api/engine.services";

export const loginService = async (payload: LoginPayloadType) => {
  let url = API_ORIGIN + "/auth/login";
  const headers = {
    "Content-Type": "application/json",
  };
  const res = await axios
    .post(url, payload, { headers })
    .then((response) => {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch((error) => {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.message,
      };
      return res;
    });
  return res;
};

export const logoutService = async () => {
  const url = API_ORIGIN + "/auth/logout";
  const authToken = await getAuthTokenService();
  let res = UNAUTHORIZED_RESPONSE;
  if (!authToken) {
    return res;
  } else {
    res = await engineGet(authToken, url);
  }
  return res;
};

const config = {
  maxAge: 60 * 60 * 24 * 3, // 3 days
  path: "/",
  domain: process.env.HOST ?? "localhost",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export async function getAuthTokenService() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("token")?.value;
  return authToken;
}

export async function getAuthUserService() {
  const url = API_ORIGIN + "/auth";
  const authToken = await getAuthTokenService();
  let res = UNAUTHORIZED_RESPONSE;
  if (!authToken) {
    return res;
  } else {
    res = await engineGet(authToken, url);
  }
  return res;
}

export async function refreshTokenService() {
  const url = API_ORIGIN + "/auth/refresh";
  const authToken = await getAuthTokenService();
  let res = UNAUTHORIZED_RESPONSE;
  if (!authToken) {
    return res;
  } else {
    res = await engineGet(authToken, url);
  }
  return res;
}

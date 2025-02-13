"use server"

import { API_ORIGIN } from "@/constants/env";
import { getAuthTokenService } from "@/api/auth.api";
import { UNAUTHORIZED_RESPONSE } from "@/constants/constants";
import { engineBulkDelete, engineCreate, engineDelete, engineGet, engineUpdate } from "@/api/engine.services";
import { ApiPayload } from "@/lib/types/apiResult.type";

export async function getListService(
  api: string,
  page: number,
  limit: number,
  search: string,
  sort: string,
  order: number
) {
  const url = `${API_ORIGIN}/${api}?page=${page}&limit=${limit}&search=${search}&sort=${sort}&order=${order}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineGet(authToken, url);
    }
    return res;
  }
  return res;
}

export async function getOneService(
  api: string,
  _id: string
) {
  const url = `${API_ORIGIN}/${api}/${_id}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineGet(authToken, url);
    }
    return res;
  }
  return res;
}

export async function getSubListService(
  api: string,
  parent: string,
  parentValue: string,
  page: number,
  limit: number,
  search: string,
  sort: string,
  order: number
) {
  const url = `${API_ORIGIN}/${api}?${parent}=${parentValue}&page=${page}&limit=${limit}&search=${search}&sort=${sort}&order=${order}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineGet(authToken, url);
    }
    return res;
  }
  return res;
}

export async function createService(
  payload: ApiPayload
) {
  const url = `${API_ORIGIN}/${payload.moduleName}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineCreate(authToken, url, payload);
    }
    return res;
  }
  return res;
}

export async function updateService(
  payload: ApiPayload
) {
  const url = `${API_ORIGIN}/${payload.moduleName}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineUpdate(authToken, url, payload);
    }
    return res;
  }
  return res;
}

export async function deleteService(
  api: string,
  moduleId: string
) {
  const url = `${API_ORIGIN}/${api}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineDelete(authToken, url, moduleId);
    }
    return res;
  }
  return res;
}

export async function bulkDeleteService(
  api: string,
  moduleIds: Array<string>
) {
  const url = `${API_ORIGIN}/${api}/bulk`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineBulkDelete(authToken, url, moduleIds);
    }
    return res;
  }
  return res;
}
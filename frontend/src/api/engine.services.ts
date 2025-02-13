"use server"

import { ApiPayload } from "@/lib/types/apiResult.type";
import axios from "axios";

export async function engineGet(authToken: string, url: string) {
  const config = {
    headers: { Authorization: `Bearer ${authToken}` },
  };
  const res = await axios
    .get(url, config)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}

export async function engineCreate(
  authToken: string,
  url: string,
  payload: ApiPayload
) {
  const config = {
    headers: { Authorization: `Bearer ${authToken}` },
  };
  const res = await axios
    .post(url, payload, config)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}

export async function engineUpdate(
  authToken: string,
  url: string,
  payload: ApiPayload
) {
  const config = {
    headers: { Authorization: `Bearer ${authToken}` },
  };
  const res = await axios
    .patch(url, payload, config)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}

export async function engineDelete(
  authToken: string,
  url: string,
  moduleId: string
) {
  const config = {
    data: { moduleId: moduleId },
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  };
  const res = await axios
    .delete(url, config)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}

export async function engineBulkDelete(
  authToken: string,
  url: string,
  moduleIds: Array<string>
) {
  const config = {
    data: { moduleIds: moduleIds },
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  };
  const res = await axios
    .delete(url, config)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}

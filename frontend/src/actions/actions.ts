"use server";

import { headers } from "next/headers";
import {
  bulkDeleteService,
  deleteService,
  getListService,
  getOneService,
  getSubListService,
} from "@/api/services";

export async function getList(
  api: string,
  page: number,
  limit: number,
  search: string,
  sort: string,
  order: number
) {
  const res = await getListService(api, page, limit, search, sort, order);
  return res;
}

export async function getMeta() {
  const getHeader = await headers();
  const title = getHeader.get("x-metadata-title");
  const description = getHeader.get("x-metadata-description");
  const data = { title: title, description: description };
  return data;
}

export async function getSubList(
  api: string,
  parentTable: string,
  parentTableValue: string,
  page: number,
  limit: number,
  search: string,
  sort: string,
  order: number
) {
  const res = await getSubListService(
    api,
    parentTable,
    parentTableValue,
    page,
    limit,
    search,
    sort,
    order
  );
  return res;
}

export async function getOne(api: string, _id: string) {
  const res = await getOneService(api, _id);
  return res;
}

export async function deleteAction(moduleName: string, moduleId: string) {
  const res = await deleteService(moduleName, moduleId);
  return res;
}

export async function bulkDeleteAction(
  moduleName: string,
  moduleIds: Array<string>
) {
  const res = await bulkDeleteService(moduleName, moduleIds);
  return res;
}

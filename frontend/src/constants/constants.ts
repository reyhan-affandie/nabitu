import { ApiResultType } from "@/lib/types/apiResult.type";
import { DefaultStateType } from "@/lib/types/defaultState.type";
import { z } from "zod";

export const defaultInvoiceState: DefaultStateType = {
  data: {
    moduleName: "invoices",
    moduleId: null,
    formMethod: "create",
    invoiceName: null,
    invoiceNumber: null,
    invoiceDueDate: null,
    invoiceAmount: null,
    invoiceStatus: null,
  },
  zodErrors: null,
  error: null,
  message: null,
};

export const FORM_INITIAL_STATE: DefaultStateType = {
  data: null,
  zodErrors: null,
  error: null,
  message: null,
};

export const MethodSchema = z.enum(["create", "update"]);

export const UNAUTHORIZED_RESPONSE: ApiResultType = {
  error: true,
  status: 401,
  statusText: "Unauthorized",
  data: "Unauthorized",
};

export const NOTFOUND_RESPONSE: ApiResultType = {
  error: true,
  status: 404,
  statusText: "Not Found",
  data: "Not Found",
};
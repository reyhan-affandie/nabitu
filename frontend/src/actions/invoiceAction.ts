"use server";

import { invoiceSchema } from "@/lib/schemas/invoice.schema";
import { createService, updateService } from "@/api/services";

export async function invoiceAction(prevState: any, formData: FormData) {
  const moduleName = "invoices";
  const formMethod = formData.get("formMethod");
  const moduleId = formData.get("moduleId");
  const invoiceName = formData.get("invoiceName");
  const invoiceNumber = formData.get("invoiceNumber");
  let invoiceDueDate = formData.get("invoiceDueDate") as string;

  if (invoiceDueDate) {
    const dateObject = new Date(invoiceDueDate);
    if (!isNaN(dateObject.getTime())) {
      invoiceDueDate = dateObject.getTime().toString();
      formData.set("invoiceDueDate", invoiceDueDate); 
    }
  }
  const invoiceAmount = formData.get("invoiceAmount");
  const invoiceStatus = formData.get("invoiceStatus");

  const data = {
    moduleName: moduleName,
    formMethod: formMethod,
    moduleId: moduleId,
    invoiceName: invoiceName,
    invoiceNumber: invoiceNumber,
    invoiceDueDate: invoiceDueDate,
    invoiceAmount: invoiceAmount,
    invoiceStatus: invoiceStatus,
  };
  const validatedFields = invoiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      ...prevState,
      data: data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix error fields.",
    };
  }
  let res;
  if (formMethod === "create") {
    res = await createService(validatedFields.data);
  } else {
    res = await updateService(validatedFields.data);
  }

  if (res) {
    if (res.error === true) {
      return {
        ...prevState,
        data: data,
        zodErrors: null,
        error: res.statusText,
        message: res.data,
      };
    } else {
      return {
        ...prevState,
        data: null,
        zodErrors: null,
        error: false,
        message: null,
      };
    }
  }
}

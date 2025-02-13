import { MethodSchema } from "@/constants/constants";
import { z } from "zod";

const ModuleSchema = z.enum(["invoices"]);
export const invoiceSchema = z.object({
  formMethod: MethodSchema,
  moduleName: ModuleSchema,
  moduleId: z.string().optional(),
  invoiceName: z
    .string()
    .min(3, {
      message: "Invoice name must have at least 3 or more characters",
    })
    .max(255, {
      message: "Invoice name must have max 255 characters",
    }),
  invoiceNumber: z
    .string()
    .min(13, {
      message: "Invoice number must have at least 13 or more characters",
    })
    .max(20, {
      message: "Invoice number must have max 20 characters",
    }),
  invoiceDueDate: z
    .string()
    .min(10, {
      message: "Invoice due date must have at least 10 or more characters",
    })
    .max(15, {
      message: "Invoice due date must have max 15 characters",
    }),
  invoiceAmount: z
    .string()
    .min(7, {
      message: "Invoice amount must have at least 7 or more characters",
    })
    .max(18, {
      message: "Invoice amount must have max 18 characters",
    }),
  invoiceStatus: z
    .string()
    .min(4, {
      message: "Invoice status must have at least 4 or morecharacters",
    })
    .max(7, {
      message: "Invoice status must have max 7 characters",
    }),
});

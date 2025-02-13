import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .min(3, {
      message: "email must have at least 3",
    })
    .max(255, {
      message: "Please enter a valid email address",
    }),
  password: z
    .string()
    .min(6, {
      message: "Password must have at least 6 or more characters",
    })
    .max(255, {
      message: "Password must have at least 6 characters",
    }),
});

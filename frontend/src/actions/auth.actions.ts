"use server";

import { cookies } from "next/headers";
import { getAuthUserService, loginService, getAuthTokenService, logoutService } from "@/api/auth.api";
import { authSchema } from "@/lib/schemas/auth.schema";

const config = {
  maxAge: 60 * 60 * 24 * 3, // 3 days
  path: "/",
  domain: process.env.HOST ?? "localhost",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const validatedFields = authSchema.safeParse({
    email: email,
    password: password,
  });
  if (!validatedFields.success) {
    return {
      ...prevState,
      data: {
        email: email,
        password: password,
      },
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Unauthorized.",
    };
  }
  
  const res = await loginService(validatedFields.data);

  if (res) {
    if (res.error === true) {
      return {
        ...prevState,
        data: {
          email: email,
          password: password,
        },
        zodErrors: null,
        error: res.statusText,
        message: res.data,
      };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("token", res.data.token, config);
  return { redirect: "/invoices" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", { ...config, maxAge: 0 });
  const res = await logoutService();
  console.log("resresresresres",res);
  return { redirect: "/" };
}

export async function getToken() {
  const data = await getAuthTokenService();
  return data;
}

export async function getAuthUser() {
  const data = await getAuthUserService();
  return data;
}

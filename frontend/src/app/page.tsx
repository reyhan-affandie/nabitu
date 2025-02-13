"use client";

import React, { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Eye, EyeOff } from "lucide-react";
import { ErrorsHandling, ErrorsZod } from "@/components/Customs/ErrorsZod";
import { loginAction } from "@/actions/auth.actions";
import { FORM_INITIAL_STATE } from "@/constants/constants";
import { useRouter } from "next/navigation";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [formState, formAction] = useActionState(loginAction, FORM_INITIAL_STATE);
  useEffect(() => {
    if (formState?.redirect) {
      router.push(formState.redirect);
    }
  }, [formState, router]);
  return (
    <div className="flex h-screen flex-1 justify-center">
      <div className="flex min-h-screen w-5/12 items-center justify-center max-lg:w-11/12">
        <div className="w-full rounded-lg bg-white p-20 shadow-lg max-lg:p-8">
          <div className="flex flex-1 justify-center">
            <div className="rounded-3xl bg-slate-800 p-6">
              <Image src={"/images/logo/logo.svg"} alt="Logo" width={176} height={32} />
            </div>
          </div>
          <form action={formAction}>
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">Email</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <Mail className="absolute right-4 top-4" size={22} />
              </div>
              <ErrorsZod error={formState?.zodErrors?.email} />
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {showPassword ? (
                  <Eye
                    className="absolute right-4 top-4"
                    size={22}
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
                ) : (
                  <EyeOff className="absolute right-4 top-4" size={22} onClick={() => setShowPassword(!showPassword)} />
                )}
              </div>
              <ErrorsZod error={formState?.zodErrors?.password} />
            </div>

            <div className="mb-5">
              <input
                type="submit"
                value="Login"
                className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
              />
            </div>
            <ErrorsHandling error={formState?.message ? formState?.message : formState?.data} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

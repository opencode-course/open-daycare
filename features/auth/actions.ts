"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/server/db/client";
import { validateLogin, type LoginFieldErrors } from "./schema";

export type LoginState = {
  errors: LoginFieldErrors;
  formError?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const errors = validateLogin({ email, password });

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      errors: {},
      formError: "Email o contraseña incorrectos.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/auth/login");
}

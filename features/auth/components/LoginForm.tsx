"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/features/auth/actions";
import type { LoginFieldErrors } from "@/features/auth/schema";

const initialState: LoginState = { errors: {} };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [clearedErrors, setClearedErrors] = useState<LoginFieldErrors>({});
  const [formErrorDismissed, setFormErrorDismissed] = useState(false);
  const emailError = clearedErrors.email ? undefined : state.errors.email;
  const passwordError = clearedErrors.password
    ? undefined
    : state.errors.password;

  function handleFieldChange(field: keyof LoginFieldErrors) {
    setClearedErrors((current) => ({ ...current, [field]: true }));
    setFormErrorDismissed(true);
  }

  return (
    <>
      <h2 className="mb-1.5 font-heading text-[30px] leading-tight font-semibold text-foreground">
        Iniciar sesión
      </h2>
      <p className="mb-7 text-[15px] text-muted">
        Ingresá para ver el día de hoy.
      </p>

      <form
        action={formAction}
        noValidate
        onSubmit={() => {
          setClearedErrors({});
          setFormErrorDismissed(false);
        }}
      >
        <div className="mb-[18px]">
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
          >
            EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="caro@opendaycare.com"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            onChange={() => handleFieldChange("email")}
            className="w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-foreground placeholder:text-[#B6A99B] focus:outline-none focus:ring-2 focus:ring-foreground"
          />
          {emailError && (
            <p id="email-error" className="mt-1 text-sm text-[#C5503A]">
              {emailError}
            </p>
          )}
        </div>

        <div className="mb-[10px]">
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
          >
            CONTRASEÑA
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? "password-error" : undefined}
            onChange={() => handleFieldChange("password")}
            className="w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-foreground placeholder:text-[#B6A99B] focus:outline-none focus:ring-2 focus:ring-foreground"
          />
          {passwordError && (
            <p id="password-error" className="mt-1 text-sm text-[#C5503A]">
              {passwordError}
            </p>
          )}
        </div>

        <div className="mb-5 text-right">
          <Link
            href="#"
            className="inline-flex min-h-6 items-center text-[13.5px] font-bold text-[#C5503A]"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="block w-full rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-4 py-[15px] text-center text-base font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Iniciar sesión
        </button>

        {state.formError && !formErrorDismissed && (
          <p role="alert" className="mt-3 text-center text-sm text-[#C5503A]">
            {state.formError}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-[14.5px] text-muted">
        ¿Te invitó la guardería?{" "}
        <Link
          href="/auth/activate-account"
          className="font-extrabold text-[#C5503A]"
        >
          Activá tu cuenta
        </Link>
      </p>
    </>
  );
}

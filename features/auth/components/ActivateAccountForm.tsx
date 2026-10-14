"use client";

import { useActionState, useEffect, useState } from "react";
import {
  activateAccountAction,
  checkInvitationCodeAction,
  type ActivationState,
  type InvitationPreview,
} from "@/features/auth/actions";
import type { ActivationFieldErrors } from "@/features/auth/schema";
import { avatarToneClasses } from "@/components/avatarTone";
import { getAvatarInitial, getAvatarTone } from "@/shared/lib/avatar";

const initialState: ActivationState = { errors: {} };
const errorMessageClassName = "mt-1 text-sm text-[#C5503A]";

type InvitationPreviewState = {
  code: string;
  preview: InvitationPreview;
};

export function ActivateAccountForm() {
  const [state, formAction, pending] = useActionState(
    activateAccountAction,
    initialState,
  );
  const [code, setCode] = useState("");
  const [previewState, setPreviewState] = useState<InvitationPreviewState | null>(
    null,
  );
  const [clearedErrors, setClearedErrors] = useState<ActivationFieldErrors>({});
  const [formErrorDismissed, setFormErrorDismissed] = useState(false);
  const normalizedCode = code.trim().toUpperCase();
  const preview =
    previewState?.code === normalizedCode ? previewState.preview : null;
  const codeError = clearedErrors.code ? undefined : state.errors.code;
  const emailError = clearedErrors.email ? undefined : state.errors.email;
  const passwordError = clearedErrors.password
    ? undefined
    : state.errors.password;

  useEffect(() => {
    if (normalizedCode.length !== 5) {
      return;
    }

    let ignoreResult = false;

    checkInvitationCodeAction(normalizedCode)
      .then((invitationPreview) => {
        if (!ignoreResult) {
          setPreviewState({ code: normalizedCode, preview: invitationPreview });
        }
      })
      .catch(() => {
        if (!ignoreResult) {
          setPreviewState({ code: normalizedCode, preview: null });
        }
      });

    return () => {
      ignoreResult = true;
    };
  }, [normalizedCode]);

  function handleFieldChange(field: keyof ActivationFieldErrors) {
    setClearedErrors((current) => ({ ...current, [field]: true }));
    setFormErrorDismissed(true);
  }

  function updateCode(value: string) {
    setCode(value.toUpperCase());
    setPreviewState(null);
    handleFieldChange("code");
  }

  function getInputClassName(hasError: boolean, normalBorder: string) {
    const borderColor = hasError ? "border-[#D9583C]" : normalBorder;
    return `w-full rounded-[14px] border-[1.5px] ${borderColor} bg-white px-4 py-[14px] text-[15px] text-foreground placeholder:text-[#B6A99B] focus:outline-none`;
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={() => {
        setClearedErrors({});
        setFormErrorDismissed(false);
      }}
    >
      {preview && (
        <section className="mb-[22px] flex items-center gap-[14px] rounded-2xl border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px]">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-full font-heading text-[19px] font-semibold ${avatarToneClasses[getAvatarTone(preview.childName)]}`}
          >
            {getAvatarInitial(preview.childName)}
          </span>
          <div>
            <p className="m-0 text-[13px] text-muted">Te invitaron a seguir a</p>
            <p className="m-0 font-heading text-[17px] font-semibold text-foreground">
              {preview.childName} · Sala {preview.roomName}
            </p>
          </div>
        </section>
      )}

      <div className="mb-[18px]">
        <label
          htmlFor="invitation-code"
          className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
        >
          CÓDIGO DE INVITACIÓN
        </label>
        <input
          id="invitation-code"
          name="code"
          type="text"
          value={code}
          onChange={(event) => updateCode(event.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={5}
          spellCheck={false}
          aria-invalid={Boolean(codeError)}
          aria-describedby={codeError ? "activation-code-error" : undefined}
          placeholder="7K4P9"
          disabled={pending}
          className={`${getInputClassName(Boolean(codeError), "border-[#EADFD0]")} font-heading text-lg font-bold tracking-[3px]`}
        />
        {codeError && (
          <p id="activation-code-error" role="alert" className={errorMessageClassName}>
            {codeError}
          </p>
        )}
      </div>

      <div className="mb-[18px]">
        <label
          htmlFor="activation-email"
          className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
        >
          EMAIL
        </label>
        <input
          id="activation-email"
          name="email"
          type="email"
          autoComplete="email"
          onChange={() => handleFieldChange("email")}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "activation-email-error" : undefined}
          placeholder="lucia.fernandez@gmail.com"
          disabled={pending}
          className={getInputClassName(Boolean(emailError), "border-[#EADFD0]")}
        />
        {emailError && (
          <p id="activation-email-error" role="alert" className={errorMessageClassName}>
            {emailError}
          </p>
        )}
      </div>

      <div className="mb-[18px]">
        <label
          htmlFor="activation-password"
          className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
        >
          CREAR CONTRASEÑA
        </label>
        <input
          id="activation-password"
          name="password"
          type="password"
          autoComplete="new-password"
          onChange={() => handleFieldChange("password")}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={
            passwordError ? "activation-password-error" : undefined
          }
          placeholder="••••••••"
          disabled={pending}
          className={getInputClassName(Boolean(passwordError), "border-[#F2A78E]")}
        />
        {passwordError && (
          <p
            id="activation-password-error"
            role="alert"
            className={errorMessageClassName}
          >
            {passwordError}
          </p>
        )}
      </div>

      <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#FBF1D6] px-4 py-[14px]">
        <input
          type="checkbox"
          name="photoConsent"
          disabled={pending}
          className="peer sr-only"
        />
        <span className="mt-px flex size-6 shrink-0 items-center justify-center rounded-lg border-2 border-[#D8C99E] bg-white transition-colors peer-checked:border-[#5FB97E] peer-checked:bg-[#5FB97E] peer-checked:[&>svg]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-[#5FB97E]/40">
          <svg
            aria-hidden="true"
            className="size-[15px] opacity-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span className="text-sm leading-[1.45] text-[#8A7234]">
          Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de
          la app.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="block w-full rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-4 py-[15px] text-center text-base font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Activar mi cuenta
      </button>

      {state.formError && !formErrorDismissed && (
        <p role="alert" className="mt-3 text-center text-sm text-[#C5503A]">
          {state.formError}
        </p>
      )}
    </form>
  );
}

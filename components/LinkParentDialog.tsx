"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { parentRoleLabels, type ParentRole } from "@/app/data/mock/kids";

const parentRoles: ParentRole[] = ["mother", "father", "tutor"];
const fieldBaseClassName =
  "w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-foreground outline-none placeholder:text-[#B6A99B]";
const errorMessageClassName = "mt-1.5 text-[12px] leading-snug text-[#D9583C]";

type LinkParentFormValues = {
  parentName: string;
  email: string;
  role: ParentRole | null;
};

type LinkParentErrors = Partial<Record<keyof LinkParentFormValues, string>>;

const initialFormValues: LinkParentFormValues = {
  parentName: "",
  email: "",
  role: null,
};

function getParentNameError(value: string) {
  return value.trim() ? null : "Ingresá el nombre del padre o madre";
}

function getEmailError(value: string) {
  const email = value.trim();

  if (!email) {
    return "Ingresá el email";
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? null
    : "El email no es válido";
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mt-px size-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[19px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

type LinkParentDialogProps = {
  kidName: string;
};

export function LinkParentDialog({ kidName }: LinkParentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState<LinkParentErrors>({});
  const firstName = kidName.split(" ")[0];

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      closeDialog();
    }
  }

  function handleClose() {
    setFormValues(initialFormValues);
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: LinkParentErrors = {
      parentName: getParentNameError(formValues.parentName) ?? undefined,
      email: getEmailError(formValues.email) ?? undefined,
      role: formValues.role ? undefined : "Elegí el parentesco",
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).every((error) => !error)) {
      closeDialog();
    }
  }

  function updateParentName(value: string) {
    setFormValues((currentValues) => ({ ...currentValues, parentName: value }));

    if (errors.parentName) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        parentName: getParentNameError(value) ?? undefined,
      }));
    }
  }

  function updateEmail(value: string) {
    setFormValues((currentValues) => ({ ...currentValues, email: value }));

    if (errors.email) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        email: getEmailError(value) ?? undefined,
      }));
    }
  }

  function updateRole(role: ParentRole) {
    setFormValues((currentValues) => ({ ...currentValues, role }));

    if (errors.role) {
      setErrors((currentErrors) => ({ ...currentErrors, role: undefined }));
    }
  }

  function getInputClassName(hasError: boolean) {
    const borderColor = hasError ? "border-[#D9583C]" : "border-[#EADFD0]";
    return `${fieldBaseClassName} ${borderColor}`;
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="flex items-center gap-3 pt-2 text-left"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
          <PlusIcon />
        </span>
        <span className="text-[14.5px] font-extrabold text-[#C5503A]">
          Vincular otro padre
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="link-parent-title"
        onClick={handleDialogClick}
        onClose={handleClose}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[480px] overflow-hidden rounded-[24px] border border-border bg-[#FBF4EC] p-0 text-foreground shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] backdrop:bg-[rgba(63,54,46,0.45)]"
      >
        <header className="flex items-center justify-between border-b border-border px-[26px] py-5">
          <div>
            <h2
              id="link-parent-title"
              className="m-0 font-heading text-[18px] leading-tight font-semibold"
            >
              Vincular padre
            </h2>
            <p className="m-0 text-[13px] text-[#A89A8B]">a {kidName}</p>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Cerrar diálogo"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
          >
            <CloseIcon />
          </button>
        </header>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain px-[26px] py-[22px]"
        >
          <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] px-4 py-[13px]">
            <InfoIcon />
            <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
              Le enviaremos un correo con un código para que active su cuenta.
              Solo verá el feed de {firstName}.
            </span>
          </div>

          <div className="mb-[18px]">
            <label
              htmlFor="link-parent-name"
              className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-muted"
            >
              NOMBRE DEL PADRE/MADRE
            </label>
            <input
              id="link-parent-name"
              name="parentName"
              value={formValues.parentName}
              onChange={(event) => updateParentName(event.target.value)}
              required
              aria-invalid={Boolean(errors.parentName)}
              aria-describedby={errors.parentName ? "link-parent-name-error" : undefined}
              placeholder="Ej. Diego Fernández"
              className={getInputClassName(Boolean(errors.parentName))}
            />
            {errors.parentName && (
              <p id="link-parent-name-error" role="alert" className={errorMessageClassName}>
                {errors.parentName}
              </p>
            )}
          </div>

          <div className="mb-[18px]">
            <label
              htmlFor="link-parent-email"
              className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-muted"
            >
              EMAIL
            </label>
            <input
              id="link-parent-email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={(event) => updateEmail(event.target.value)}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "link-parent-email-error" : undefined}
              placeholder="correo@ejemplo.com"
              className={getInputClassName(Boolean(errors.email))}
            />
            {errors.email && (
              <p id="link-parent-email-error" role="alert" className={errorMessageClassName}>
                {errors.email}
              </p>
            )}
          </div>

          <fieldset
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? "link-parent-role-error" : undefined}
            className="mb-5 border-0 p-0"
          >
            <legend className="mb-[10px] block text-[12px] font-extrabold tracking-[0.7px] text-muted">
              PARENTESCO
            </legend>
            <div className="flex gap-[9px]">
              {parentRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  aria-pressed={formValues.role === role}
                  onClick={() => updateRole(role)}
                  className={`flex-1 rounded-full border-[1.5px] p-[11px] text-[14px] font-extrabold ${
                    formValues.role === role
                      ? "border-[#9FB8EC] bg-[#CCD8F4] text-[#4E72C8]"
                      : "border-border bg-[#FFFDF9] text-[#6E6359]"
                  }`}
                >
                  {parentRoleLabels[role]}
                </button>
              ))}
            </div>
            {errors.role && (
              <p id="link-parent-role-error" role="alert" className={errorMessageClassName}>
                {errors.role}
              </p>
            )}
          </fieldset>

          <div className="mb-5 rounded-2xl border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center">
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
              CÓDIGO DE INVITACIÓN
            </div>
            <div className="font-heading text-[34px] leading-tight font-semibold tracking-[7px] text-[#8A7234]">
              7K4P9
            </div>
            <div className="mt-1.5 text-[13px] text-[#A88526]">
              Vence en 7 días
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] p-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
          >
            <SendIcon />
            Enviar invitación
          </button>
        </form>
      </dialog>
    </>
  );
}

"use client";

import {
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type MouseEvent,
} from "react";
import { addKidAction, type AddKidActionResult } from "@/features/kids/actions";
import { BirthDateInput } from "@/features/kids/components/BirthDateInput";
import { validateAddKid, type AddKidValues } from "@/features/kids/schema";
import type { Room } from "@/features/kids/data";

const labelClassName =
  "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-muted";
const fieldBaseClassName =
  "w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-foreground outline-none placeholder:text-[#B6A99B]";
const errorMessageClassName = "mt-1.5 text-[12px] leading-snug text-[#D9583C]";

const initialFormValues: AddKidValues = {
  name: "",
  birthDate: "",
  classroom: "",
  allergies: "",
  notes: "",
};

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[17px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-[#B0A290] sm:right-4 sm:size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function AddKidDialog({ rooms }: { rooms: Room[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState<AddKidActionResult["errors"]>({});
  const [formError, setFormError] = useState<string>();
  const [isPending, startTransition] = useTransition();

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
    setFormError(undefined);
  }

  function updateField(field: keyof AddKidValues, value: string) {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
    setFormError(undefined);

    if (
      (field === "name" || field === "birthDate" || field === "classroom") &&
      errors[field]
    ) {
      const nextErrors = validateAddKid({ ...formValues, [field]: value });
      setErrors((currentErrors) => {
        return {
          ...currentErrors,
          [field]: nextErrors[field],
        };
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateAddKid(formValues);

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    startTransition(async () => {
      const result = await addKidAction(formValues);
      setErrors(result.errors);
      setFormError(result.formError);

      if (result.success) {
        closeDialog();
      }
    });
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
        className="flex shrink-0 items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
      >
        <PlusIcon />
        Agregar niño
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="add-kid-title"
        onClick={handleDialogClick}
        onClose={handleClose}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[520px] overflow-hidden rounded-[24px] border border-border bg-[#FBF4EC] p-0 text-foreground shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] backdrop:bg-[rgba(63,54,46,0.45)]"
      >
        <header className="flex items-center justify-between border-b border-border px-[26px] py-5">
          <button
            type="button"
            onClick={closeDialog}
            disabled={isPending}
            className="text-[15px] font-bold text-muted"
          >
            Cancelar
          </button>
          <h2
            id="add-kid-title"
            className="m-0 font-heading text-[18px] leading-none font-semibold"
          >
            Agregar niño
          </h2>
          <button
            type="submit"
            form="add-kid-form"
            disabled={isPending}
            className="text-[15px] font-extrabold text-[#D9583C]"
          >
            Guardar
          </button>
        </header>

        <form
          id="add-kid-form"
          onSubmit={handleSubmit}
          className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain px-[26px] py-6"
        >
          {formError && (
            <p role="alert" className={`${errorMessageClassName} mb-4`}>
              {formError}
            </p>
          )}

          <div className="mb-[18px]">
            <label htmlFor="kid-name" className={labelClassName}>
              NOMBRE COMPLETO
            </label>
            <input
              id="kid-name"
              name="name"
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "kid-name-error" : undefined}
              placeholder="Ej. Martina López"
              className={getInputClassName(Boolean(errors.name))}
            />
            {errors.name && (
              <p id="kid-name-error" role="alert" className={errorMessageClassName}>
                {errors.name}
              </p>
            )}
          </div>

          <div className="mb-[18px] grid grid-cols-[0.9fr_1.1fr] gap-[14px] sm:grid-cols-2">
            <div>
              <label htmlFor="kid-birth-date" className={labelClassName}>
                FECHA DE NACIMIENTO
              </label>
              <BirthDateInput
                id="kid-birth-date"
                name="birthDate"
                value={formValues.birthDate}
                onChange={(value) => updateField("birthDate", value)}
                error={errors.birthDate}
                className={getInputClassName(Boolean(errors.birthDate))}
              />
              {errors.birthDate && (
                <p
                  id="kid-birth-date-error"
                  role="alert"
                  className={errorMessageClassName}
                >
                  {errors.birthDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="kid-classroom" className={labelClassName}>
                SALA
              </label>
              <div className="relative">
                <select
                  id="kid-classroom"
                  name="classroom"
                  value={formValues.classroom}
                  onChange={(event) =>
                    updateField("classroom", event.target.value)
                  }
                  aria-invalid={Boolean(errors.classroom)}
                  aria-describedby={
                    errors.classroom ? "kid-classroom-error" : undefined
                  }
                  className={`${getInputClassName(Boolean(errors.classroom))} appearance-none px-2 pr-6 text-[13px] font-bold sm:px-4 sm:pr-10 sm:text-[15px]`}
                >
                  <option value="">Elegí una sala</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              {errors.classroom && (
                <p
                  id="kid-classroom-error"
                  role="alert"
                  className={errorMessageClassName}
                >
                  {errors.classroom}
                </p>
              )}
            </div>
          </div>

          <div className="mb-[18px]">
            <label htmlFor="kid-allergies" className={labelClassName}>
              ALERGIAS (ETIQUETAS)
            </label>
            <input
              id="kid-allergies"
              name="allergies"
              value={formValues.allergies}
              onChange={(event) => updateField("allergies", event.target.value)}
              placeholder="Ej. Maní, Lactosa"
              className={getInputClassName(false)}
            />
          </div>

          <div>
            <label htmlFor="kid-notes" className={labelClassName}>
              NOTAS MÉDICAS
            </label>
            <textarea
              id="kid-notes"
              name="notes"
              value={formValues.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Indicaciones, medicación, contactos…"
              className={`${getInputClassName(false)} min-h-[90px] resize-y leading-[1.5]`}
            />
          </div>
        </form>
      </dialog>
    </>
  );
}

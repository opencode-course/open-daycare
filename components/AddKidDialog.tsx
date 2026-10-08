"use client";

import { useRef } from "react";

const labelClassName =
  "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-muted";
const fieldClassName =
  "w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-foreground outline-none placeholder:text-[#B6A99B]";

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
      className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[#B0A290]"
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

export function AddKidDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
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
        className="m-auto w-[calc(100%-2rem)] max-w-[520px] overflow-hidden rounded-[24px] border border-border bg-[#FBF4EC] p-0 text-foreground shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] backdrop:bg-[rgba(63,54,46,0.45)]"
      >
        <header className="flex items-center justify-between border-b border-border px-[26px] py-5">
          <button
            type="button"
            onClick={closeDialog}
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
            className="text-[15px] font-extrabold text-[#D9583C]"
          >
            Guardar
          </button>
        </header>

        <form
          id="add-kid-form"
          onSubmit={(event) => event.preventDefault()}
          className="px-[26px] py-6"
        >
          <div className="mb-[18px]">
            <label htmlFor="kid-name" className={labelClassName}>
              NOMBRE COMPLETO
            </label>
            <input
              id="kid-name"
              name="name"
              placeholder="Ej. Martina López"
              className={fieldClassName}
            />
          </div>

          <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
            <div>
              <label htmlFor="kid-birth-date" className={labelClassName}>
                FECHA DE NACIMIENTO
              </label>
              <input
                id="kid-birth-date"
                name="birthDate"
                placeholder="dd/mm/aaaa"
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="kid-classroom" className={labelClassName}>
                SALA
              </label>
              <div className="relative">
                <select
                  id="kid-classroom"
                  name="classroom"
                  defaultValue=""
                  className={`${fieldClassName} appearance-none pr-10 font-bold`}
                >
                  <option value="">Elegí una sala</option>
                  <option value="Soles">Soles</option>
                </select>
                <ChevronIcon />
              </div>
            </div>
          </div>

          <div className="mb-[18px]">
            <label htmlFor="kid-allergies" className={labelClassName}>
              ALERGIAS (ETIQUETAS)
            </label>
            <input
              id="kid-allergies"
              name="allergies"
              placeholder="Ej. Maní, Lactosa"
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="kid-notes" className={labelClassName}>
              NOTAS MÉDICAS
            </label>
            <textarea
              id="kid-notes"
              name="notes"
              placeholder="Indicaciones, medicación, contactos…"
              className={`${fieldClassName} min-h-[90px] resize-y leading-[1.5]`}
            />
          </div>
        </form>
      </dialog>
    </>
  );
}

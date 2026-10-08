"use client";

import { useRef } from "react";
import { kids } from "@/app/data/mock/kids";
import {
  currentUser,
  postTypeChipLabels,
  type PostType,
} from "@/app/data/mock/feed";
import { avatarToneClasses } from "@/components/avatarTone";

const postTypeOrder: PostType[] = [
  "meal",
  "nap",
  "activity",
  "achievement",
  "mood",
  "photo",
  "announcement",
];

export function CreatePostDialog() {
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
        className="mb-6 flex w-full items-center gap-[14px] rounded-[18px] border border-border bg-surface px-[18px] py-[14px] text-left shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-base font-semibold text-white">
          {currentUser.initials}
        </span>
        <span className="flex-1 text-[15px] text-[#a89a8b]">
          Compartí un momento…
        </span>
        <span className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-accent-soft text-[#e0654a]">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="create-post-title"
        className="m-auto w-[calc(100%-32px)] max-w-[580px] overflow-hidden rounded-[24px] border border-border bg-[#FBF4EC] p-0 text-foreground shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] backdrop:bg-[rgba(63,54,46,0.45)]"
      >
        <form onSubmit={(event) => event.preventDefault()}>
          <header className="flex items-center justify-between border-b border-border px-[26px] py-5">
            <button
              type="button"
              onClick={closeDialog}
              className="text-[15px] font-bold text-muted"
            >
              Cancelar
            </button>
            <h2
              id="create-post-title"
              className="m-0 font-heading text-[18px] font-semibold text-foreground"
            >
              Nueva publicación
            </h2>
            <button
              type="submit"
              className="text-[15px] font-extrabold text-[#D9583C]"
            >
              Publicar
            </button>
          </header>

          <div className="px-[26px] py-6">
            <section className="mb-[22px]" aria-labelledby="post-audience-label">
              <h3
                id="post-audience-label"
                className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted"
              >
                PARA
              </h3>
              <div className="flex flex-wrap gap-[9px]">
                {kids.map((kid) => (
                  <button
                    key={kid.slug}
                    type="button"
                    className="flex items-center gap-2 rounded-full border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] py-[6px] pr-[14px] pl-[6px] text-sm font-bold text-[#6E6359]"
                  >
                    <span
                      className={`flex size-[26px] items-center justify-center rounded-full font-heading text-[13px] font-semibold ${avatarToneClasses[kid.avatarTone]}`}
                      aria-hidden="true"
                    >
                      {kid.avatarInitial}
                    </span>
                    {kid.name.split(" ")[0]}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded-full border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[6px] text-sm font-bold text-[#6E6359]"
                >
                  Toda la sala
                </button>
              </div>
            </section>

            <section className="mb-[22px]" aria-labelledby="post-type-label">
              <h3
                id="post-type-label"
                className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted"
              >
                TIPO
              </h3>
              <div className="flex flex-wrap gap-[9px]">
                {postTypeOrder.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="rounded-full border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-2 text-[13.5px] font-extrabold text-[#6E6359]"
                  >
                    {postTypeChipLabels[type]}
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="post-description-label">
              <h3
                id="post-description-label"
                className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted"
              >
                DESCRIPCIÓN
              </h3>
              <textarea
                aria-labelledby="post-description-label"
                placeholder="Contá cómo le fue hoy…"
                className="mb-[22px] min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] leading-[1.5] text-foreground placeholder:text-[#B6A99B] focus:outline-none"
              />
            </section>

            <section aria-labelledby="post-photos-label">
              <h3
                id="post-photos-label"
                className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted"
              >
                FOTOS
              </h3>
              <div className="flex gap-3">
                <div
                  aria-hidden="true"
                  className="flex size-24 items-center justify-center rounded-[14px] border border-border bg-[#F4ECE1] text-[#CBB89F]"
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
                  </svg>
                </div>
                <div className="flex size-24 flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C5503A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-xs">Agregar</span>
                </div>
              </div>
            </section>
          </div>
        </form>
      </dialog>
    </>
  );
}

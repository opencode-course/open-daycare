"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ChangeEvent,
} from "react";
import { createPost } from "@/features/feed/actions";
import type { Kid } from "@/features/kids/data";
import {
  postTypeChipLabels,
  type PostType,
} from "@/features/feed/data";
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

const postTypeSelectedStyles: Record<PostType, string> = {
  meal: "border-transparent bg-[#9A7B1E] text-white",
  nap: "border-transparent bg-[#E7DCF6] text-[#7B5FC0]",
  activity: "border-transparent bg-[#2E89A6] text-white",
  achievement: "border-transparent bg-[#CFEBD8] text-[#3E9B6C]",
  mood: "border-transparent bg-[#F9D2DE] text-[#C56486]",
  photo: "border-transparent bg-[#FBD8CC] text-[#D9684A]",
  announcement: "border-transparent bg-[#CCD8F4] text-[#4E72C8]",
};

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = "image/jpeg,image/png,image/webp,image/heic";

type CreatePostFormValues = {
  selectedKidIds: string[];
  wholeRoom: boolean;
  type: PostType | null;
  description: string;
};

type PhotoWithPreview = {
  file: File;
  previewUrl: string;
};

function createInitialFormValues(): CreatePostFormValues {
  return {
    selectedKidIds: [],
    wholeRoom: false,
    type: null,
    description: "",
  };
}

type CreatePostDialogProps = {
  name: string;
  initials: string;
  kids: Kid[];
};

export function CreatePostDialog({ name, initials, kids }: CreatePostDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formValues, setFormValues] = useState(createInitialFormValues);
  const [photos, setPhotos] = useState<PhotoWithPreview[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audienceIsInvalid =
    !formValues.wholeRoom && formValues.selectedKidIds.length === 0;
  const typeIsInvalid = formValues.type === null;
  const descriptionIsInvalid = formValues.description.trim().length === 0;

  function toggleKid(kidId: string) {
    setFormValues((current) => {
      const isSelected = current.selectedKidIds.includes(kidId);

      return {
        ...current,
        wholeRoom: false,
        selectedKidIds: isSelected
          ? current.selectedKidIds.filter((id) => id !== kidId)
          : [...current.selectedKidIds, kidId],
      };
    });
  }

  function toggleWholeRoom() {
    setFormValues((current) => {
      const wholeRoom = !current.wholeRoom;

      return {
        ...current,
        wholeRoom,
        selectedKidIds: wholeRoom ? [] : current.selectedKidIds,
      };
    });
  }

  function selectPostType(type: PostType) {
    setFormValues((current) => ({ ...current, type }));
  }

  function updateDescription(description: string) {
    setFormValues((current) => ({ ...current, description }));
  }

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      setFormError(`Máximo ${MAX_PHOTOS} fotos por publicación.`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const validPhotos: PhotoWithPreview[] = [];

    for (const file of filesToAdd) {
      if (file.size > MAX_FILE_SIZE) {
        setFormError("Cada foto debe pesar menos de 5 MB.");
        continue;
      }

      if (!ACCEPTED_MIME_TYPES.split(",").includes(file.type)) {
        setFormError("Solo se permiten fotos JPEG, PNG, WEBP o HEIC.");
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validPhotos.push({ file, previewUrl });
    }

    if (validPhotos.length > 0) {
      setPhotos((current) => [...current, ...validPhotos]);
      setFormError(null);
    }
  }

  function removePhoto(index: number) {
    setPhotos((current) => {
      const photoToRemove = current[index];
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }

      return current.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    setFormError(null);

    if (audienceIsInvalid || typeIsInvalid || descriptionIsInvalid) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("type", formValues.type!);
    formData.append("description", formValues.description.trim());
    formData.append("wholeRoom", formValues.wholeRoom.toString());

    if (!formValues.wholeRoom) {
      for (const kidId of formValues.selectedKidIds) {
        formData.append("children", kidId);
      }
    }

    for (const photo of photos) {
      formData.append("photos", photo.file);
    }

    const result = await createPost(formData);

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    dialogRef.current?.close();
  }

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

  function resetForm() {
    setFormValues(createInitialFormValues());
    setPhotos((current) => {
      for (const photo of current) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return [];
    });
    setHasSubmitted(false);
    setFormError(null);
    setIsSubmitting(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={`Compartí un momento como ${name}`}
        className="mb-6 flex w-full items-center gap-[14px] rounded-[18px] border border-border bg-surface px-[18px] py-[14px] text-left shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-base font-semibold text-white">
          {initials}
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
        onClick={handleDialogClick}
        onClose={resetForm}
        className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[580px] overflow-hidden rounded-[24px] border border-border bg-[#FBF4EC] p-0 text-foreground shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] backdrop:bg-[rgba(63,54,46,0.45)]"
      >
        <form noValidate onSubmit={handleSubmit}>
          <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border px-4 py-5 sm:px-[26px]">
            <button
              type="button"
              onClick={closeDialog}
              className="justify-self-start text-sm font-bold text-muted sm:text-[15px]"
            >
              Cancelar
            </button>
            <h2
              id="create-post-title"
              className="m-0 text-center font-heading text-base font-semibold text-foreground sm:text-[18px]"
            >
              Nueva publicación
            </h2>
            <button
              type="submit"
              disabled={isSubmitting}
              className="justify-self-end text-sm font-extrabold text-[#D9583C] sm:text-[15px] disabled:opacity-50"
            >
              {isSubmitting ? "Publicando…" : "Publicar"}
            </button>
          </header>

          <div className="max-h-[calc(100dvh-112px)] overflow-y-auto px-[26px] py-6">
            <section className="mb-[22px]" aria-labelledby="post-audience-label">
              <h3
                id="post-audience-label"
                className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted"
              >
                PARA
              </h3>
              <div
                className="flex flex-wrap gap-[9px]"
                role="group"
                aria-label="Destinatarios"
                aria-describedby={
                  hasSubmitted && audienceIsInvalid ? "audience-error" : undefined
                }
              >
                {kids.map((kid) => {
                  const isSelected = formValues.selectedKidIds.includes(kid.id);

                  return (
                    <button
                      key={kid.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleKid(kid.id)}
                      className={`flex items-center gap-2 rounded-full border-[1.5px] py-[6px] pr-[14px] pl-[6px] text-sm font-bold ${
                        isSelected
                          ? "border-[#3F362E] bg-[#3F362E] text-white"
                          : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                      }`}
                    >
                      <span
                        className={`flex size-[26px] items-center justify-center rounded-full font-heading text-[13px] font-semibold ${avatarToneClasses[kid.avatarTone]}`}
                        aria-hidden="true"
                      >
                        {kid.avatarInitial}
                      </span>
                      {kid.fullName.split(" ")[0]}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={formValues.wholeRoom}
                  onClick={toggleWholeRoom}
                  className={`rounded-full border-[1.5px] px-4 py-[6px] text-sm font-bold ${
                    formValues.wholeRoom
                      ? "border-[#3F362E] bg-[#3F362E] text-white"
                      : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                  }`}
                >
                  Toda la sala
                </button>
              </div>
              {hasSubmitted && audienceIsInvalid && (
                <p
                  id="audience-error"
                  role="alert"
                  className="mt-2 text-sm font-bold text-[#D9583C]"
                >
                  Elegí para quién
                </p>
              )}
            </section>

            <section className="mb-[22px]" aria-labelledby="post-type-label">
              <h3
                id="post-type-label"
                className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted"
              >
                TIPO
              </h3>
              <div
                className="flex flex-wrap gap-[9px]"
                role="group"
                aria-label="Tipo de publicación"
                aria-describedby={
                  hasSubmitted && typeIsInvalid ? "type-error" : undefined
                }
              >
                {postTypeOrder.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={formValues.type === type}
                    onClick={() => selectPostType(type)}
                    className={`rounded-full border-[1.5px] px-4 py-2 text-[13.5px] font-extrabold ${
                      formValues.type === type
                        ? postTypeSelectedStyles[type]
                        : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
                  >
                    {postTypeChipLabels[type]}
                  </button>
                ))}
              </div>
              {hasSubmitted && typeIsInvalid && (
                <p
                  id="type-error"
                  role="alert"
                  className="mt-2 text-sm font-bold text-[#D9583C]"
                >
                  Elegí un tipo
                </p>
              )}
            </section>

            <section
              className="mb-[22px]"
              aria-labelledby="post-description-label"
            >
              <h3
                id="post-description-label"
                className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted"
              >
                DESCRIPCIÓN
              </h3>
              <textarea
                aria-labelledby="post-description-label"
                aria-invalid={hasSubmitted && descriptionIsInvalid}
                aria-describedby={
                  hasSubmitted && descriptionIsInvalid
                    ? "description-error"
                    : undefined
                }
                value={formValues.description}
                onChange={(event) => updateDescription(event.target.value)}
                placeholder="Contá cómo le fue hoy…"
                className={`min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] bg-white px-4 py-[14px] text-[15px] leading-[1.5] text-foreground placeholder:text-[#B6A99B] focus:outline-none ${
                  hasSubmitted && descriptionIsInvalid
                    ? "border-[#D9583C]"
                    : "border-[#EADFD0]"
                }`}
              />
              {hasSubmitted && descriptionIsInvalid && (
                <p
                  id="description-error"
                  role="alert"
                  className="mt-2 text-sm font-bold text-[#D9583C]"
                >
                  Escribí la descripción
                </p>
              )}
            </section>

            <section aria-labelledby="post-photos-label">
              <h3
                id="post-photos-label"
                className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted"
              >
                FOTOS
              </h3>
              <div className="flex flex-wrap gap-3">
                {photos.map((photo, index) => (
                  <div
                    key={photo.previewUrl}
                    className="relative size-24 overflow-hidden rounded-[14px] border border-border"
                  >
                    <img
                      src={photo.previewUrl}
                      alt={`Foto ${index + 1}`}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      aria-label={`Eliminar foto ${index + 1}`}
                      className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <div className="flex size-24 flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_MIME_TYPES}
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex size-full flex-col items-center justify-center gap-1.5"
                    >
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
                    </button>
                  </div>
                )}
              </div>
              {formError && (
                <p
                  role="alert"
                  className="mt-2 text-sm font-bold text-[#D9583C]"
                >
                  {formError}
                </p>
              )}
            </section>
          </div>
        </form>
      </dialog>
    </>
  );
}

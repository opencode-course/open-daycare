import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { avatarToneClasses } from "@/components/avatarTone";
import { LinkParentDialog } from "@/features/kids/components/LinkParentDialog";
import { getKidById } from "@/features/kids/data";

type KidPageProps = PageProps<"/kids/[id]">;

export const instant = false;

export async function generateMetadata({ params }: KidPageProps): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const kid = await getKidById(id);

  if (!kid) {
    notFound();
  }

  return {
    title: `${kid.fullName} · OpenDayCare`,
  };
}

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[22px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export default async function KidProfilePage({ params }: KidPageProps) {
  await connection();
  const { id } = await params;
  const kid = await getKidById(id);

  if (!kid) {
    notFound();
  }

  const medicalNotes = kid.medicalNotes?.trim() ?? "";
  const healthSummary = [
    kid.allergyTags.length > 0
      ? `Alergias: ${kid.allergyTags.join(", ")}`
      : "",
    medicalNotes,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto w-full max-w-[820px] px-5 pb-20 pt-[34px] sm:px-10">
      <Link
        href="/kids"
        className="mb-5 flex items-center gap-[7px] text-sm font-bold text-muted"
      >
        <BackIcon />
        Volver a Niños
      </Link>

      <div className="grid grid-cols-1 items-start gap-[26px] md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <header className="flex items-center gap-[18px]">
            <span
              className={`flex size-[84px] shrink-0 items-center justify-center rounded-full font-heading text-[34px] font-semibold ${avatarToneClasses[kid.avatarTone]}`}
            >
              {kid.avatarInitial}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="m-0 font-heading text-2xl leading-tight font-semibold text-foreground sm:text-[28px]">
                {kid.fullName}
              </h1>
              <p className="mt-[3px] text-[15px] text-muted">
                {kid.age} años · Sala {kid.roomName}
              </p>
            </div>
            <a
              href="#"
              className="shrink-0 rounded-xl border-[1.5px] border-border bg-surface px-4 py-[9px] text-sm font-bold text-[#6E6359]"
            >
              Editar
            </a>
          </header>

          <section className="flex gap-[14px] rounded-2xl bg-[#FBDAD6] px-[18px] py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#F4A8A0]">
              <WarningIcon />
            </span>
            <div>
              <h2 className="mb-0.5 text-[15px] font-extrabold text-[#C5413A]">
                Alergias y notas
              </h2>
              <p className="m-0 text-[14.5px] leading-[1.5] text-[#B25249]">
                {healthSummary || "Sin alergias ni notas registradas."}
              </p>
            </div>
          </section>

          <dl className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex justify-between gap-4 border-b border-[#F0E6D8] px-[18px] py-[15px]">
              <dt className="text-[14.5px] text-muted">Fecha de nacimiento</dt>
              <dd className="m-0 text-right text-[14.5px] font-extrabold text-foreground">
                {kid.birthDate}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#F0E6D8] px-[18px] py-[15px]">
              <dt className="text-[14.5px] text-muted">Sala</dt>
              <dd className="m-0 text-right text-[14.5px] font-extrabold text-foreground">
                {kid.roomName}
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-[18px] py-[15px]">
              <dt className="text-[14.5px] text-muted">Ingreso</dt>
              <dd className="m-0 text-right text-[14.5px] font-extrabold text-foreground">
                {kid.enrolledAt}
              </dd>
            </div>
          </dl>
        </div>

        <aside className="flex flex-col gap-[14px]">
          <a
            href="#"
            className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-foreground p-[13px] text-[15px] font-extrabold text-white"
          >
            <SparkleIcon />
            Resumen del día
          </a>

          <section className="rounded-2xl border border-border bg-surface px-[18px] py-4">
            <h2 className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
              PADRES VINCULADOS
            </h2>
            <LinkParentDialog childId={kid.id} kidName={kid.fullName} />
          </section>
        </aside>
      </div>
    </div>
  );
}

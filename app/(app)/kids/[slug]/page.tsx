import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkParentDialog } from "@/components/LinkParentDialog";
import {
  kidDetail,
  kids,
  parentRoleLabels,
  parentStatusLabels,
  parentStatusText,
  type AvatarTone,
} from "@/app/data/mock/kids";

type KidPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

const avatarToneClasses: Record<AvatarTone, string> = {
  sky: "bg-[#A9D9E8] text-[#1F7A93]",
  rose: "bg-[#F4B8CC] text-[#C44A7A]",
  mint: "bg-[#B9DEC4] text-[#3E8B62]",
  sun: "bg-[#F4DC8E] text-[#9A7B1E]",
  lilac: "bg-[#C9B6E8] text-[#7B5FC0]",
  skySoft: "bg-[#A9C7E8] text-white",
};

const parentAvatarToneClasses: Record<AvatarTone, string> = {
  sky: "bg-[#A9D9E8]",
  rose: "bg-[#F4B8CC]",
  mint: "bg-[#B9DEC4]",
  sun: "bg-[#F4DC8E]",
  lilac: "bg-[#C9B6E8]",
  skySoft: "bg-[#A9C7E8]",
};

export function generateStaticParams() {
  return kids.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: KidPageProps): Promise<Metadata> {
  const { slug } = await params;
  const kid = kids.find((item) => item.slug === slug);

  if (!kid) {
    notFound();
  }

  return {
    title: `${kid.name} · OpenDayCare`,
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
  const { slug } = await params;
  const kid = kids.find((item) => item.slug === slug);

  if (!kid) {
    notFound();
  }

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
                {kid.name}
              </h1>
              <p className="mt-[3px] text-[15px] text-muted">
                {kid.age} años · Sala {kidDetail.classroom}
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
                {kidDetail.notes}
              </p>
            </div>
          </section>

          <dl className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex justify-between gap-4 border-b border-[#F0E6D8] px-[18px] py-[15px]">
              <dt className="text-[14.5px] text-muted">Fecha de nacimiento</dt>
              <dd className="m-0 text-right text-[14.5px] font-extrabold text-foreground">
                {kidDetail.birthDate}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#F0E6D8] px-[18px] py-[15px]">
              <dt className="text-[14.5px] text-muted">Sala</dt>
              <dd className="m-0 text-right text-[14.5px] font-extrabold text-foreground">
                {kidDetail.classroom}
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-[18px] py-[15px]">
              <dt className="text-[14.5px] text-muted">Ingreso</dt>
              <dd className="m-0 text-right text-[14.5px] font-extrabold text-foreground">
                {kidDetail.enrollment}
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
            <div className="flex flex-col gap-[14px]">
              {kidDetail.parents.map((parent) => (
                <div key={parent.name} className="flex items-center gap-3">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-base font-semibold text-white ${parentAvatarToneClasses[parent.avatarTone]}`}
                  >
                    {parent.avatarInitial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[14.5px] font-extrabold text-foreground">
                      {parent.name}
                    </p>
                    <p className="m-0 text-[12.5px] text-muted">
                      {parentRoleLabels[parent.role]} · {parentStatusText[parent.status]}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-[9px] py-1 text-[10.5px] font-extrabold ${
                      parent.status === "active"
                        ? "bg-[#CFEBD8] text-[#3E9B6C]"
                        : "bg-[#F7E7A6] text-[#9A7B1E]"
                    }`}
                  >
                    {parentStatusLabels[parent.status]}
                  </span>
                </div>
              ))}

              <LinkParentDialog kidName={kid.name} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

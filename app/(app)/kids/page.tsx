import type { Metadata } from "next";
import { kids } from "@/app/data/mock/kids";
import { KidCard } from "@/components/KidCard";

export const metadata: Metadata = {
  title: "Niños · OpenDayCare",
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#B0A290"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

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

export default function KidsPage() {
  return (
    <div className="mx-auto w-full max-w-[880px] px-5 pb-20 pt-[34px] sm:px-10">
      <header className="mb-[22px] flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
            GESTIÓN
          </p>
          <h1 className="m-0 font-heading text-[30px] leading-tight font-semibold text-foreground">
            Niños
          </h1>
        </div>

        <a
          href="#"
          className="flex shrink-0 items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
        >
          <PlusIcon />
          Agregar niño
        </a>
      </header>

      <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-border bg-surface px-4 py-3">
        <SearchIcon />
        <input
          aria-label="Buscar niño"
          readOnly
          placeholder="Buscar niño…"
          className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-[#B6A99B]"
        />
      </div>

      <div className="mb-[14px] flex items-center gap-3">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-foreground">
          SALA SOLES
        </span>
        <span className="text-[13px] text-muted">{kids.length} niños</span>
        <span aria-hidden="true" className="h-px flex-1 bg-[#E7DAC8]" />
      </div>

      <section
        aria-label="Niños de la sala Soles"
        className="grid grid-cols-1 gap-[14px] sm:grid-cols-2"
      >
        {kids.map((kid) => (
          <KidCard key={kid.slug} kid={kid} />
        ))}
      </section>
    </div>
  );
}

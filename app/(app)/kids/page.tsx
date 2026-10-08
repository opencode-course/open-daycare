import type { Metadata } from "next";
import { kids } from "@/app/data/mock/kids";
import { AddKidDialog } from "@/components/AddKidDialog";
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

        <AddKidDialog />
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

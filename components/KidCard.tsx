import Link from "next/link";
import type { Kid } from "@/app/data/mock/kids";
import { avatarToneClasses } from "@/components/avatarTone";

function getParentsLabel(count: number) {
  if (count === 0) {
    return "sin padres vinculados";
  }

  return `${count} ${count === 1 ? "padre vinculado" : "padres vinculados"}`;
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CBB89F"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function KidCard({ kid }: { kid: Kid }) {
  const hasAllergies = kid.allergies.length > 0;
  const hasBadges = hasAllergies || kid.parentsCount === 0;

  return (
    <Link
      href={`/kids/${kid.slug}`}
      className="flex min-w-0 items-center gap-3.5 rounded-[18px] border border-border bg-surface p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition duration-150 hover:-translate-y-0.5 hover:border-[#F2A78E]"
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-full font-heading text-[19px] font-semibold ${avatarToneClasses[kid.avatarTone]}`}
      >
        {kid.avatarInitial}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-base font-semibold text-foreground">
          {kid.name}
        </span>
        <span className="block text-[13px] text-muted">
          {kid.age} años · {getParentsLabel(kid.parentsCount)}
        </span>
      </span>

      {hasBadges ? (
        <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {kid.allergies.map((allergy) => (
            <span
              key={allergy}
              className="rounded-full bg-[#FBD8CC] px-[9px] py-[5px] text-[11px] leading-none font-extrabold text-[#D9684A]"
            >
              {allergy.toLocaleUpperCase("es")}
            </span>
          ))}
          {kid.parentsCount === 0 && (
            <span className="rounded-full bg-[#F9D2DE] px-[9px] py-[5px] text-[11px] leading-none font-extrabold text-[#C56486]">
              VINCULAR
            </span>
          )}
        </span>
      ) : (
        <ChevronIcon />
      )}
    </Link>
  );
}

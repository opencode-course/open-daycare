import Link from "next/link";
import { avatarToneClasses } from "@/components/avatarTone";
import type { Kid } from "@/features/kids/data";

export function KidCard({ kid }: { kid: Kid }) {
  const [firstAllergy, ...remainingAllergies] = kid.allergyTags;

  return (
    <Link
      href={`/kids/${kid.id}`}
      className="flex min-w-0 items-center gap-3.5 rounded-[18px] border border-border bg-surface p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition duration-150 hover:-translate-y-0.5 hover:border-[#F2A78E]"
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-full font-heading text-[19px] font-semibold ${avatarToneClasses[kid.avatarTone]}`}
      >
        {kid.avatarInitial}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-base font-semibold text-foreground">
          {kid.fullName}
        </span>
        <span className="block text-[13px] text-muted">
          {kid.age} años · sin padres vinculados
        </span>
      </span>

      <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
        {firstAllergy && (
          <span
            className="rounded-full bg-[#FBD8CC] px-[9px] py-[5px] text-[11px] leading-none font-extrabold text-[#D9684A]"
          >
            {firstAllergy.toLocaleUpperCase("es")}
          </span>
        )}
        {remainingAllergies.length > 0 && (
          <span className="group/allergies relative">
            <span
              aria-label={`Alergias adicionales: ${remainingAllergies.join(", ")}`}
              className="inline-block rounded-full bg-[#FBD8CC] px-[9px] py-[5px] text-[11px] leading-none font-extrabold text-[#D9684A]"
            >
              +{remainingAllergies.length}
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 hidden w-max max-w-52 rounded-lg bg-foreground px-3 py-2 text-left text-xs font-semibold text-surface shadow-lg group-hover/allergies:block"
            >
              <span className="flex flex-col gap-1">
                {kid.allergyTags.map((allergy, index) => (
                  <span key={`${allergy}-${index}`}>{allergy}</span>
                ))}
              </span>
            </span>
          </span>
        )}
        <span className="rounded-full bg-[#F9D2DE] px-[9px] py-[5px] text-[11px] leading-none font-extrabold text-[#C56486]">
          VINCULAR
        </span>
      </span>
    </Link>
  );
}

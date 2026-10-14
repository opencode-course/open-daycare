import Link from "next/link";
import { avatarToneClasses } from "@/components/avatarTone";
import type { Kid } from "@/features/kids/data";

export function KidCard({ kid }: { kid: Kid }) {
  return (
    <Link
      href="#"
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
        {kid.allergyTags.map((allergyTag) => (
          <span
            key={allergyTag}
            className="rounded-full bg-[#FBD8CC] px-[9px] py-[5px] text-[11px] leading-none font-extrabold text-[#D9684A]"
          >
            {allergyTag.toLocaleUpperCase("es")}
          </span>
        ))}
        <span className="rounded-full bg-[#F9D2DE] px-[9px] py-[5px] text-[11px] leading-none font-extrabold text-[#C56486]">
          VINCULAR
        </span>
      </span>
    </Link>
  );
}

import { currentUser } from "@/app/data/mock/feed";
import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <Link
        href="/"
        className="flex items-center gap-[11px] px-2 pb-[22px]"
        aria-label="OpenDayCare, Sala Soles"
      >
        <span className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#f8c3a8] to-accent">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </span>
        <span>
          <span className="block font-heading text-[17px] font-semibold leading-none">
            OpenDayCare
          </span>
          <span className="mt-0.5 block text-[11.5px] text-muted">
            Sala Soles
          </span>
        </span>
      </Link>

      <a
        href="#"
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-linear-to-b from-[#f4977e] to-[#ee8164] px-3 py-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nueva publicación
      </a>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Navegación principal">
        <Link
          href="/"
          aria-current="page"
          className="flex items-center gap-3 rounded-xl bg-[#fbe3d8] px-3 py-[11px] text-[14.5px] font-extrabold text-[#d9583c]"
        >
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
            <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
          Feed
        </Link>
        <a
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] font-semibold text-[#6e6359]"
        >
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
            <circle cx="9" cy="7" r="3" />
            <circle cx="17" cy="9" r="2.4" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
          </svg>
          Niños
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] font-semibold text-[#6e6359]"
        >
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
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          Avisos
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] font-semibold text-[#6e6359]"
        >
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Mi cuenta
        </a>
      </nav>

      <div className="mt-[10px] border-t border-border pt-[14px]">
        <div className="flex items-center gap-[11px] px-2 py-1.5">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-accent font-heading text-base font-semibold text-white">
            {currentUser.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold text-foreground">
              {currentUser.name}
            </span>
            <span className="block text-xs text-muted">{currentUser.role}</span>
          </span>
          <a
            href="#"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-background text-muted"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}

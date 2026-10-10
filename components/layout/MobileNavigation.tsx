"use client";

import { useState, type ReactNode } from "react";

type MobileNavigationProps = {
  children: ReactNode;
};

export function MobileNavigation({ children }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 top-0 z-40 flex h-16 w-screen items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          aria-controls="mobile-navigation-drawer"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          className="flex size-10 items-center justify-center rounded-xl text-foreground"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-linear-to-br from-[#f8c3a8] to-accent">
          <svg
            width="18"
            height="18"
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
        <span className="font-heading text-lg font-semibold">OpenDayCare</span>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex w-screen lg:hidden">
          <div
            id="mobile-navigation-drawer"
            className="w-[280px] max-w-[85vw] shrink-0 overflow-y-auto bg-surface shadow-[8px_0_24px_-12px_rgba(63,54,46,0.35)]"
          >
            <div className="flex h-14 items-center justify-end px-4">
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setIsOpen(false)}
                className="flex size-9 items-center justify-center rounded-xl text-muted"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsOpen(false)}
            className="h-full min-w-0 flex-1 bg-black/30"
          />
        </div>
      )}
    </>
  );
}

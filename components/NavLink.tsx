"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: ReactNode;
};

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${
        isActive
          ? "bg-[#fbe3d8] font-extrabold text-[#d9583c]"
          : "font-semibold text-[#6e6359]"
      }`}
    >
      {children}
    </Link>
  );
}

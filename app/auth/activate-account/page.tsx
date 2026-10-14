import type { Metadata } from "next";
import Link from "next/link";
import { ActivateAccountForm } from "@/features/auth/components/ActivateAccountForm";

export const metadata: Metadata = {
  title: "Activar cuenta · OpenDayCare",
};

export default function ActivateAccountPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FBF4EC] px-5 py-8 sm:p-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-[22px] flex size-[58px] items-center justify-center rounded-[18px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
          <svg
            aria-hidden="true"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>

        <h1 className="mb-2 font-heading text-[32px] leading-[1.15] font-semibold text-foreground">
          Bienvenida a OpenDayCare
        </h1>
        <p className="mb-[26px] text-[15.5px] leading-[1.55] text-muted">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        <ActivateAccountForm />

        <p className="mt-[22px] text-center text-[14.5px] text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-extrabold text-[#C5503A]"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

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

        <section className="mb-[22px] flex items-center gap-[14px] rounded-2xl border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#A9D9E8] font-heading text-[19px] font-semibold text-[#1F7A93]">
            M
          </span>
          <div>
            <p className="m-0 text-[13px] text-muted">
              Te invitaron a seguir a
            </p>
            <p className="m-0 font-heading text-[17px] font-semibold text-foreground">
              Mateo · Sala Soles
            </p>
          </div>
        </section>

        <label
          htmlFor="invitation-code"
          className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
        >
          CÓDIGO DE INVITACIÓN
        </label>
        <input
          id="invitation-code"
          name="invitationCode"
          type="text"
          placeholder="7K4P9"
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] font-heading text-lg font-bold tracking-[3px] text-foreground placeholder:text-[#B6A99B] focus:outline-none"
        />

        <label
          htmlFor="email"
          className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
        >
          EMAIL
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="lucia.fernandez@gmail.com"
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-foreground placeholder:text-[#B6A99B] focus:outline-none"
        />

        <label
          htmlFor="password"
          className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
        >
          CREAR CONTRASEÑA
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white px-4 py-[14px] text-[15px] text-foreground placeholder:text-[#B6A99B] focus:outline-none"
        />

        <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#FBF1D6] px-4 py-[14px]">
          <input
            type="checkbox"
            name="photoConsent"
            className="peer sr-only"
          />
          <span className="mt-px flex size-6 shrink-0 items-center justify-center rounded-lg border-2 border-[#D8C99E] bg-white transition-colors peer-checked:border-[#5FB97E] peer-checked:bg-[#5FB97E] peer-checked:[&>svg]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-[#5FB97E]/40">
            <svg
              aria-hidden="true"
              className="size-[15px] opacity-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="text-sm leading-[1.45] text-[#8A7234]">
            Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
            de la app.
          </span>
        </label>

        <Link
          href="#"
          className="block w-full rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-4 py-[15px] text-center text-base font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
        >
          Activar mi cuenta
        </Link>

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

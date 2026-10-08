import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Iniciar sesión · OpenDayCare",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FBF4EC] lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,#F6A98E_0%,#F2937A_45%,#EC7E62_100%)] px-10 py-14 text-white lg:flex xl:px-[60px]">
        <div
          aria-hidden="true"
          className="absolute -right-[120px] -top-[140px] size-[420px] rounded-full bg-white/[0.12]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-[110px] -left-[80px] size-[300px] rounded-full bg-white/[0.10]"
        />

        <div className="relative flex items-center gap-[13px]">
          <span className="flex size-[46px] items-center justify-center rounded-[14px] bg-white/[0.22]">
            <svg
              aria-hidden="true"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </span>
          <span className="font-heading text-[21px] font-semibold tracking-[0.5px]">
            OpenDayCare
          </span>
        </div>

        <div className="relative">
          <h1 className="mb-[18px] font-heading text-[42px] leading-[1.12] font-semibold">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p className="m-0 max-w-[430px] text-[17px] leading-[1.6] text-white/[0.92]">
            Publicá momentos, gestioná las salas y mantené a las familias cerca,
            desde un solo lugar.
          </p>
        </div>

        <p className="relative m-0 text-sm text-white/[0.9]">
          🌿 Guardería Sala Soles
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 lg:min-h-0 lg:px-10 lg:py-10">
        <div className="w-full max-w-[392px]">
          <h2 className="mb-1.5 font-heading text-[30px] leading-tight font-semibold text-foreground">
            Iniciar sesión
          </h2>
          <p className="mb-7 text-[15px] text-muted">
            Ingresá para ver el día de hoy.
          </p>

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
            placeholder="caro@opendaycare.com"
            className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-foreground placeholder:text-[#B6A99B] focus:outline-none"
          />

          <label
            htmlFor="password"
            className="mb-2 block text-xs font-bold tracking-[0.7px] text-muted"
          >
            CONTRASEÑA
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-foreground placeholder:text-[#B6A99B] focus:outline-none"
          />

          <div className="mb-5 text-right">
            <Link
              href="#"
              className="text-[13.5px] font-bold text-[#C5503A]"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Link
            href="/"
            className="block w-full rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-4 py-[15px] text-center text-base font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
          >
            Iniciar sesión
          </Link>

          <p className="mt-6 text-center text-[14.5px] text-muted">
            ¿Te invitó la guardería?{" "}
            <Link
              href="/auth/activate-account"
              className="font-extrabold text-[#C5503A]"
            >
              Activá tu cuenta
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

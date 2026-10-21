"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center justify-center px-5 py-20 text-center sm:px-10">
      <div className="mb-4 text-5xl">⚠️</div>
      <h2 className="mb-2 font-heading text-2xl font-semibold text-foreground">
        No se pudieron cargar las publicaciones
      </h2>
      <p className="mb-6 text-muted">
        Ocurrió un error al cargar el feed. Por favor, intentá de nuevo.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-6 py-3 font-heading text-base font-semibold text-white transition-colors hover:bg-accent/90"
      >
        Reintentar
      </button>
    </div>
  );
}

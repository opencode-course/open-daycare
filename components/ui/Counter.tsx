"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section className="mb-6 rounded-2xl border border-[#e7dac8] bg-surface p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
        Contador
      </h2>
      <p
        className="mb-4 text-2xl font-extrabold text-foreground"
        aria-live="polite"
      >
        {count}
      </p>
      <button
        type="button"
        onClick={() => setCount((currentCount) => currentCount + 1)}
        className="rounded-xl bg-accent px-4 py-2 text-sm font-extrabold text-white transition hover:opacity-90"
      >
        Sumar
      </button>
    </section>
  );
}

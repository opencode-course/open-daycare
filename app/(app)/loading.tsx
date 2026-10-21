export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-5 pb-20 pt-[34px] sm:px-10">
      <div className="mb-6">
        <div className="mb-1 h-4 w-32 animate-pulse rounded bg-surface" />
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
      </div>

      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-card p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-surface" />
            <div className="flex-1">
              <div className="mb-2 h-4 w-32 animate-pulse rounded bg-surface" />
              <div className="h-3 w-24 animate-pulse rounded bg-surface" />
            </div>
          </div>
          <div className="mb-3 h-4 w-20 animate-pulse rounded bg-surface" />
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-surface" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

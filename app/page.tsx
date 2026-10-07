import { currentUser, posts, room } from "@/app/data/mock/feed";
import { PostCard } from "@/components/PostCard";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-[34px] sm:px-10">
      <header className="mb-6">
        <p className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#d9583c]">
          {room.eyebrow}
        </p>
        <h1 className="m-0 font-heading text-[30px] font-semibold leading-tight text-foreground">
          {room.greeting}
        </h1>
        <p className="mt-[5px] text-[14.5px] text-muted">{room.meta}</p>
      </header>

      <a
        href="#"
        className="mb-6 flex items-center gap-[14px] rounded-[18px] border border-border bg-surface px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-base font-semibold text-white">
          {currentUser.initials}
        </span>
        <span className="flex-1 text-[15px] text-[#a89a8b]">
          Compartí un momento…
        </span>
        <span className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-accent-soft text-[#e0654a]">
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
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </a>

      <div className="mb-[14px] flex items-center gap-[14px]">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8a7c6d]">
          PUBLICADO HOY
        </span>
        <span className="h-px flex-1 bg-[#e7dac8]" />
      </div>

      <section className="flex flex-col gap-4" aria-label="Publicaciones de hoy">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}

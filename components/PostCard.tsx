import { postTypeLabels, type Post, type PostType } from "@/app/data/mock/feed";

const badgeStyles: Record<PostType, { background: string; foreground: string }> = {
  achievement: { background: "bg-[#cfebd8]", foreground: "text-[#3e9b6c]" },
  activity: { background: "bg-[#c7e7f1]", foreground: "text-[#2e89a6]" },
  announcement: { background: "bg-[#ccd8f4]", foreground: "text-[#4e72c8]" },
};

const badgeDotStyles: Record<PostType, string> = {
  achievement: "bg-[#3e9b6c]",
  activity: "bg-[#2e89a6]",
  announcement: "bg-[#4e72c8]",
};

export function PostCard({ post }: { post: Post }) {
  const badgeStyle = badgeStyles[post.type];

  return (
    <article className="rounded-[20px] border border-border bg-surface px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <header className="mb-[14px] flex items-center gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full font-heading text-[17px] font-semibold ${
            post.avatarTone === "announcement"
              ? "bg-[#ccd8f4] text-[#4e72c8]"
              : "bg-[#a9d9e8] text-[#1f7a93]"
          }`}
          aria-hidden="true"
        >
          {post.avatarTone === "announcement" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
          ) : (
            post.avatarInitials
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-heading text-[16.5px] font-semibold leading-tight text-foreground">
            {post.author}
          </h2>
          <p className="text-[12.5px] text-[#a89a8b]">
            {post.time} · publicado por vos
          </p>
        </div>

        <span
          className={`flex shrink-0 items-center gap-[7px] rounded-full px-3 py-1.5 ${badgeStyle.background}`}
        >
          <span
            className={`size-2 rounded-full ${badgeDotStyles[post.type]}`}
            aria-hidden="true"
          />
          <span
            className={`text-xs font-extrabold tracking-[0.5px] ${badgeStyle.foreground}`}
          >
            {postTypeLabels[post.type]}
          </span>
        </span>
      </header>

      <p className="mb-[10px] text-[12.5px] text-[#a89a8b]">{post.audience}</p>
      <p className="m-0 text-[15.5px] leading-[1.55] text-[#4a4038]">
        {post.text}
      </p>

      {post.photoLabel && (
        <a
          href="#"
          aria-label={post.photoLabel}
          className="mt-[14px] flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#dbcdba] bg-[#f4ece1] text-[#b0a290]"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
          </svg>
          <span className="text-[13.5px]">{post.photoLabel}</span>
        </a>
      )}

      <footer className="mt-4 flex items-center gap-[18px] border-t border-[#f0e6d8] pt-[14px]">
        <span className="flex items-center gap-[7px] text-sm font-bold text-[#e0654a]">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="#e0654a"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {post.hearts}
        </span>

        <a
          href="#"
          aria-label={`${post.comments} ${post.comments === 1 ? "comentario" : "comentarios"}`}
          className="flex items-center gap-[7px] text-sm font-bold text-[#94887b]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
          </svg>
          {post.comments}
        </a>

        <span className="flex-1" />
        <a href="#" className="text-sm font-extrabold text-[#c5503a]">
          Editar
        </a>
      </footer>
    </article>
  );
}

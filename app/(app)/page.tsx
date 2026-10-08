import { posts, room } from "@/app/data/mock/feed";
import { CreatePostDialog } from "@/components/CreatePostDialog";
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

      <CreatePostDialog />

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

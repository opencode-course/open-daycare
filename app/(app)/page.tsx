import { connection } from "next/server";
import { posts, room } from "@/features/feed/data";
import { CreatePostDialog } from "@/features/feed/components/CreatePostDialog";
import { PostCard } from "@/features/feed/components/PostCard";
import { requireUser } from "@/server/auth/session";

export const instant = false;

export default async function Home() {
  await connection();

  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-[34px] sm:px-10">
      <header className="mb-6">
        <p className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#d9583c]">
          {`GUARDERÍA · ${user.daycareName.toUpperCase()}`}
        </p>
        <h1 className="m-0 font-heading text-[30px] font-semibold leading-tight text-foreground">
          Buenas, {user.firstName}
        </h1>
        <p className="mt-[5px] text-[14.5px] text-muted">{room.meta}</p>
      </header>

      <CreatePostDialog name={user.fullName} initials={user.initials} />

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

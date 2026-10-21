import { connection } from "next/server";
import { getPosts } from "@/features/feed/get-posts";
import { CreatePostDialog } from "@/features/feed/components/CreatePostDialog";
import { PostCard } from "@/features/feed/components/PostCard";
import { requireUser } from "@/server/auth/session";
import { getKids } from "@/features/kids/data";
import { Counter } from "@/components/ui/Counter";

export const instant = false;

export default async function Home() {
  await connection();

  const [user, kids, posts] = await Promise.all([
    requireUser(),
    getKids(),
    getPosts(),
  ]);

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-[34px] sm:px-10">
      <header className="mb-6">
        <p className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#d9583c]">
          {`GUARDERÍA · ${user.daycareName.toUpperCase()}`}
        </p>
        <h1 className="m-0 font-heading text-[30px] font-semibold leading-tight text-foreground">
          Buenas, {user.firstName}
        </h1>
      </header>

      <Counter />

      <CreatePostDialog name={user.fullName} initials={user.initials} kids={kids} />

      <section className="flex flex-col gap-4" aria-label="Publicaciones">
        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted">No hay publicaciones aún</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </section>
    </div>
  );
}

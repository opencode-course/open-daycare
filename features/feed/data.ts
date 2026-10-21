import { createClient } from "@/server/db/client";

export type PostType =
  | "achievement"
  | "activity"
  | "announcement"
  | "meal"
  | "nap"
  | "mood"
  | "photo";

export type PostPhoto = {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
  position: number;
};

export type Post = {
  id: string;
  type: PostType;
  authorId: string;
  author: string;
  avatarInitials: string;
  avatarTone: "child" | "staff";
  time: string;
  audience: string;
  text: string;
  photos: PostPhoto[];
  hearts: number;
  comments: number;
};

export const postTypeLabels: Record<PostType, string> = {
  achievement: "LOGRO",
  activity: "ACTIVIDAD",
  announcement: "ANUNCIO",
  meal: "COMIDA",
  nap: "SIESTA",
  mood: "ÁNIMO",
  photo: "FOTO",
};

export const postTypeChipLabels: Record<PostType, string> = {
  meal: "Comida",
  nap: "Siesta",
  activity: "Actividad",
  achievement: "Logro",
  mood: "Ánimo",
  photo: "Foto",
  announcement: "Anuncio",
};

type DbPostRow = {
  id: string;
  type: PostType;
  body: string;
  published_at: string;
  users: { id: string; full_name: string } | null;
  post_photos: Array<{
    id: string;
    url: string;
    width: number | null;
    height: number | null;
    position: number;
  }>;
  post_children: Array<{
    children: { id: string; full_name: string } | null;
  }>;
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTime(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return `${hours}:${minutes}`;
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
}

function buildAudience(children: { id: string; full_name: string }[]): string {
  if (children.length === 0) return "Para: toda la sala";
  const names = children.map((c) => c.full_name).join(", ");
  return `Para: familia de ${names}`;
}

function mapDbRowToPost(row: DbPostRow): Post {
  const authorName = row.users?.full_name ?? "Desconocido";
  const children = row.post_children
    .map((pc) => pc.children)
    .filter((c): c is { id: string; full_name: string } => c !== null);

  return {
    id: row.id,
    type: row.type,
    authorId: row.users?.id ?? "",
    author: authorName,
    avatarInitials: getInitials(authorName),
    avatarTone: children.length > 0 ? "child" : "staff",
    time: formatTime(row.published_at),
    audience: buildAudience(children),
    text: row.body,
    photos: row.post_photos.map((p) => ({
      id: p.id,
      url: p.url,
      width: p.width ?? undefined,
      height: p.height ?? undefined,
      position: p.position,
    })),
    hearts: 0,
    comments: 0,
  };
}

export async function getPosts(): Promise<Post[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      type,
      body,
      published_at,
      users(id, full_name),
      post_photos(id, url, width, height, position),
      post_children(
        children(id, full_name)
      )
    `,
    )
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  const posts = data ?? [];

  // Generar signed URLs para todas las fotos en batch
  const photoPaths = posts.flatMap((post) =>
    post.post_photos.map((photo) => photo.url),
  );

  if (photoPaths.length === 0) {
    return posts.map(mapDbRowToPost);
  }

  const { data: signedUrlsData, error: signedUrlsError } = await supabase.storage
    .from("posts")
    .createSignedUrls(photoPaths, 60 * 60); // 1 hora

  if (signedUrlsError) {
    throw signedUrlsError;
  }

  const signedUrlMap = new Map(
    signedUrlsData.map((item) => [item.path, item.signedUrl]),
  );

  const postsWithSignedUrls = posts.map((post) => ({
    ...post,
    post_photos: post.post_photos.map((photo) => ({
      ...photo,
      url: signedUrlMap.get(photo.url) ?? photo.url,
    })),
  }));

  return postsWithSignedUrls.map(mapDbRowToPost);
}


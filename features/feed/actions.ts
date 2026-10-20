"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/server/db/client";
import { requireUser } from "@/server/auth/session";
import type { PostType } from "@/features/feed/data";

export type CreatePostResult =
  | { success: true }
  | { success: false; error: string };

const VALID_POST_TYPES: PostType[] = [
  "meal",
  "nap",
  "activity",
  "achievement",
  "mood",
  "photo",
  "announcement",
];

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const GENERIC_ERROR = "No se pudo crear la publicación. Intentá de nuevo.";

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  const user = await requireUser();

  if (user.role !== "staff" && user.role !== "admin") {
    return { success: false, error: "No tenés permiso para publicar." };
  }

  const type = String(formData.get("type") ?? "").trim();
  if (!VALID_POST_TYPES.includes(type as PostType)) {
    return { success: false, error: "Elegí un tipo válido." };
  }

  const description = String(formData.get("description") ?? "").trim();
  if (!description) {
    return { success: false, error: "Escribí la descripción." };
  }

  const wholeRoom = formData.get("wholeRoom") === "true";
  const childrenRaw = formData.getAll("children").map(String);

  if (!wholeRoom && childrenRaw.length === 0) {
    return { success: false, error: "Elegí al menos un niño." };
  }

  if (!wholeRoom && childrenRaw.some((id) => !isUuid(id))) {
    return { success: false, error: "Alguno de los niños no es válido." };
  }

  const photoFiles = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

  if (photoFiles.length > MAX_PHOTOS) {
    return { success: false, error: `Máximo ${MAX_PHOTOS} fotos por publicación.` };
  }

  for (const file of photoFiles) {
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Cada foto debe pesar menos de 5 MB." };
    }
    if (!(file.type in ALLOWED_MIME_TYPES)) {
      return {
        success: false,
        error: "Solo se permiten fotos JPEG, PNG, WEBP o HEIC.",
      };
    }
  }

  const supabase = await createClient();

  try {
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        type: type as PostType,
        body: description,
      })
      .select("id")
      .single();

    if (postError || !post) {
      return { success: false, error: GENERIC_ERROR };
    }

    const postId = post.id;
    const uploadedPaths: string[] = [];

    try {
      if (photoFiles.length > 0) {
        for (let position = 0; position < photoFiles.length; position++) {
          const file = photoFiles[position];
          const ext = ALLOWED_MIME_TYPES[file.type];
          const storagePath = `${postId}/${position}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("posts")
            .upload(storagePath, file);

          if (uploadError) {
            throw new Error("upload_failed");
          }

          uploadedPaths.push(storagePath);

          const { error: photoInsertError } = await supabase
            .from("post_photos")
            .insert({
              post_id: postId,
              url: storagePath,
              position,
            });

          if (photoInsertError) {
            throw new Error("photo_insert_failed");
          }
        }
      }

      if (!wholeRoom) {
        const { error: childrenError } = await supabase
          .from("post_children")
          .insert(
            childrenRaw.map((childId) => ({
              post_id: postId,
              child_id: childId,
            })),
          );

        if (childrenError) {
          throw new Error("children_insert_failed");
        }
      }
    } catch {
      await rollbackPost(supabase, postId, uploadedPaths);
      return { success: false, error: GENERIC_ERROR };
    }

    revalidatePath("/", "page");
    return { success: true };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}

async function rollbackPost(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  uploadedPaths: string[],
) {
  if (uploadedPaths.length > 0) {
    await supabase.storage.from("posts").remove(uploadedPaths);
  }
  await supabase.from("posts").delete().eq("id", postId);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

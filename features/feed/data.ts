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


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
  avatarInitials?: string;
  avatarTone: "child" | "announcement";
  time: string;
  audience: string;
  text: string;
  photoLabel?: string;
  photos: PostPhoto[];
  hearts: number;
  comments: number;
};

export const room = {
  meta: "12 niños · martes 17 jun",
};

export const posts: Post[] = [
  {
    id: "achievement-mateo",
    type: "achievement",
    authorId: "mock-mateo",
    author: "Mateo",
    avatarInitials: "M",
    avatarTone: "child",
    time: "14:20",
    audience: "Para: familia de Mateo",
    text: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    photos: [],
    hearts: 3,
    comments: 1,
  },
  {
    id: "activity-mateo",
    type: "activity",
    authorId: "mock-mateo",
    author: "Mateo",
    avatarInitials: "M",
    avatarTone: "child",
    time: "09:40",
    audience: "Para: familia de Mateo",
    text: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoLabel: "Foto · pintando con témperas",
    photos: [],
    hearts: 5,
    comments: 2,
  },
  {
    id: "announcement-general",
    type: "announcement",
    authorId: "mock-general",
    author: "Anuncio general",
    avatarTone: "announcement",
    time: "07:50",
    audience: "Para: toda la sala",
    text: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    photos: [],
    hearts: 8,
    comments: 0,
  },
];

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

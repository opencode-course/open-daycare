export type PostType = "achievement" | "activity" | "announcement";

export type Post = {
  id: string;
  type: PostType;
  author: string;
  avatarInitials?: string;
  avatarTone: "child" | "announcement";
  time: string;
  audience: string;
  text: string;
  photoLabel?: string;
  hearts: number;
  comments: number;
};

export const currentUser = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initials: "C",
};

export const room = {
  eyebrow: "GUARDERÍA · SALA SOLES",
  greeting: "Buenas, Caro",
  meta: "12 niños · martes 17 jun",
};

export const posts: Post[] = [
  {
    id: "achievement-mateo",
    type: "achievement",
    author: "Mateo",
    avatarInitials: "M",
    avatarTone: "child",
    time: "14:20",
    audience: "Para: familia de Mateo",
    text: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    hearts: 3,
    comments: 1,
  },
  {
    id: "activity-mateo",
    type: "activity",
    author: "Mateo",
    avatarInitials: "M",
    avatarTone: "child",
    time: "09:40",
    audience: "Para: familia de Mateo",
    text: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoLabel: "Foto · pintando con témperas",
    hearts: 5,
    comments: 2,
  },
  {
    id: "announcement-general",
    type: "announcement",
    author: "Anuncio general",
    avatarTone: "announcement",
    time: "07:50",
    audience: "Para: toda la sala",
    text: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    hearts: 8,
    comments: 0,
  },
];

export const postTypeLabels: Record<PostType, string> = {
  achievement: "LOGRO",
  activity: "ACTIVIDAD",
  announcement: "ANUNCIO",
};

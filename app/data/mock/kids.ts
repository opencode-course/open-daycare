export type AvatarTone = "sky" | "rose" | "mint" | "sun" | "lilac" | "skySoft";
export type ParentRole = "mother" | "father";
export type ParentStatus = "active" | "pending";

export type ParentLink = {
  name: string;
  avatarInitial: string;
  avatarTone: AvatarTone;
  role: ParentRole;
  status: ParentStatus;
};

export type Kid = {
  slug: string;
  name: string;
  avatarInitial: string;
  avatarTone: AvatarTone;
  age: number;
  allergies: string[];
  parentsCount: number;
};

export const kids: Kid[] = [
  {
    slug: "mateo-fernandez",
    name: "Mateo Fernández",
    avatarInitial: "M",
    avatarTone: "sky",
    age: 3,
    allergies: ["Maní"],
    parentsCount: 2,
  },
  {
    slug: "sofia-mendez",
    name: "Sofía Méndez",
    avatarInitial: "S",
    avatarTone: "rose",
    age: 2,
    allergies: [],
    parentsCount: 1,
  },
  {
    slug: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    avatarInitial: "B",
    avatarTone: "mint",
    age: 3,
    allergies: [],
    parentsCount: 2,
  },
  {
    slug: "valentina-soto",
    name: "Valentina Soto",
    avatarInitial: "V",
    avatarTone: "sun",
    age: 2,
    allergies: [],
    parentsCount: 0,
  },
  {
    slug: "tomas-diaz",
    name: "Tomás Díaz",
    avatarInitial: "T",
    avatarTone: "lilac",
    age: 3,
    allergies: ["Lactosa"],
    parentsCount: 1,
  },
  {
    slug: "emma-castro",
    name: "Emma Castro",
    avatarInitial: "E",
    avatarTone: "rose",
    age: 2,
    allergies: [],
    parentsCount: 1,
  },
  {
    slug: "lucas-romero",
    name: "Lucas Romero",
    avatarInitial: "L",
    avatarTone: "sky",
    age: 3,
    allergies: [],
    parentsCount: 1,
  },
  {
    slug: "olivia-vega",
    name: "Olivia Vega",
    avatarInitial: "O",
    avatarTone: "mint",
    age: 2,
    allergies: [],
    parentsCount: 1,
  },
];

export const kidDetail = {
  birthDate: "12 mar 2022",
  classroom: "Soles",
  enrollment: "feb 2025",
  notes: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
  parents: [
    {
      name: "Lucía Fernández",
      avatarInitial: "L",
      avatarTone: "lilac",
      role: "mother",
      status: "active",
    },
    {
      name: "Diego Fernández",
      avatarInitial: "D",
      avatarTone: "skySoft",
      role: "father",
      status: "pending",
    },
  ] satisfies ParentLink[],
};

export const parentRoleLabels: Record<ParentRole, string> = {
  mother: "Mamá",
  father: "Papá",
};

export const parentStatusLabels: Record<ParentStatus, string> = {
  active: "ACTIVA",
  pending: "PENDIENTE",
};

export const parentStatusText: Record<ParentStatus, string> = {
  active: "activa",
  pending: "invitación enviada",
};

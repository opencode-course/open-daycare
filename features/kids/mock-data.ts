import type { AvatarTone } from "@/shared/types/avatar";

export type MockKid = {
  slug: string;
  name: string;
  avatarInitial: string;
  avatarTone: AvatarTone;
  age: number;
  allergies: string[];
  parentsCount: number;
};

export const kids: MockKid[] = [
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

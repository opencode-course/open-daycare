import type { AvatarTone } from "@/shared/types/avatar";

const avatarTones: readonly AvatarTone[] = [
  "sky",
  "rose",
  "mint",
  "sun",
  "lilac",
  "skySoft",
];

export function getAvatarInitial(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase("es");
}

export function getAvatarTone(name: string): AvatarTone {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }

  return avatarTones[hash % avatarTones.length];
}

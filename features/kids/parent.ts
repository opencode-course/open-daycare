import type { AvatarTone } from "@/shared/types/avatar";

export type ParentRole = "mother" | "father" | "tutor";
export type ParentStatus = "active" | "pending";

export type ParentLink = {
  name: string;
  avatarInitial: string;
  avatarTone: AvatarTone;
  role: ParentRole;
  status: ParentStatus;
};

export const parentRoleLabels: Record<ParentRole, string> = {
  mother: "Mamá",
  father: "Papá",
  tutor: "Tutor/a",
};

export const parentStatusLabels: Record<ParentStatus, string> = {
  active: "ACTIVA",
  pending: "PENDIENTE",
};

export const parentStatusText: Record<ParentStatus, string> = {
  active: "activa",
  pending: "invitación enviada",
};

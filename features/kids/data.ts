import "server-only";

import { createClient } from "@/server/db/client";
import {
  allergyTagLabels,
} from "@/features/kids/schema";
import type { AvatarTone } from "@/shared/types/avatar";
import { getAvatarInitial, getAvatarTone } from "@/shared/lib/avatar";
import {
  roleByRelationship,
  type ParentLink,
  type ParentStatus,
  type RelationshipType,
} from "@/features/kids/parent";

export {
  parentRoleLabels,
  parentStatusLabels,
  parentStatusText,
} from "@/features/kids/parent";
export type {
  ParentLink,
  ParentRole,
  ParentStatus,
} from "@/features/kids/parent";
export type { AvatarTone } from "@/shared/types/avatar";

export type Room = {
  id: string;
  name: string;
};

export type Kid = {
  id: string;
  fullName: string;
  avatarInitial: string;
  avatarTone: AvatarTone;
  age: number;
  allergyTags: string[];
  roomName: string;
  birthDate: string;
  enrolledAt: string;
  medicalNotes: string | null;
};

type RoomRow = {
  id: string;
  name: string;
};

type KidRow = {
  id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  allergy_tags: string[] | null;
  medical_notes: string | null;
  room: { name: string } | { name: string }[] | null;
};

type ParentChildRow = {
  relationship: RelationshipType;
  parent: { full_name: string } | { full_name: string }[] | null;
};

type InvitationRow = {
  full_name: string;
  relationship: RelationshipType;
};

const spanishMonths = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name")
    .order("name");

  if (error) {
    throw error;
  }

  return ((data ?? []) as RoomRow[]).map(({ id, name }) => ({ id, name }));
}

export async function getKids(): Promise<Kid[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .select(
      "id, full_name, birth_date, enrolled_at, allergy_tags, medical_notes, room:rooms(name)",
    )
    .order("full_name");

  if (error) {
    throw error;
  }

  return ((data ?? []) as KidRow[]).map(mapKidRow);
}

export async function getKidById(id: string): Promise<Kid | null> {
  if (!isUuid(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .select(
      "id, full_name, birth_date, enrolled_at, allergy_tags, medical_notes, room:rooms(name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapKidRow(data as KidRow) : null;
}

export async function getParentsForKid(childId: string): Promise<ParentLink[]> {
  if (!isUuid(childId)) {
    return [];
  }

  const supabase = await createClient();
  const [activeResult, pendingResult] = await Promise.all([
    supabase
      .from("parent_children")
      .select(
        "relationship, parent:users!parent_children_parent_id_fkey(full_name)",
      )
      .eq("child_id", childId),
    supabase
      .from("invitations")
      .select("full_name, relationship")
      .eq("child_id", childId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString()),
  ]);

  if (activeResult.error) {
    throw activeResult.error;
  }

  if (pendingResult.error) {
    throw pendingResult.error;
  }

  const activeParents = ((activeResult.data ?? []) as ParentChildRow[])
    .map((row) => {
      const parent = Array.isArray(row.parent) ? row.parent[0] : row.parent;

      return parent
        ? mapParentLink(parent.full_name, row.relationship, "active")
        : null;
    })
    .filter((parent): parent is ParentLink => parent !== null)
    .sort(compareParentNames);

  const pendingParents = ((pendingResult.data ?? []) as InvitationRow[])
    .map((row) => mapParentLink(row.full_name, row.relationship, "pending"))
    .sort(compareParentNames);

  return [...activeParents, ...pendingParents];
}

function mapKidRow(row: KidRow): Kid {
  const room = Array.isArray(row.room) ? row.room[0] : row.room;
  const fullName = row.full_name.trim();

  return {
    id: row.id,
    fullName,
    avatarInitial: getAvatarInitial(fullName),
    avatarTone: getAvatarTone(fullName),
    age: calculateAge(row.birth_date),
    allergyTags: (row.allergy_tags ?? []).map(
      (tag) => allergyTagLabels[tag] ?? tag,
    ),
    roomName: room?.name ?? "",
    birthDate: formatBirthDate(row.birth_date),
    enrolledAt: formatEnrollmentDate(row.enrolled_at),
    medicalNotes: row.medical_notes,
  };
}

function mapParentLink(
  name: string,
  relationship: RelationshipType,
  status: ParentStatus,
): ParentLink {
  const fullName = name.trim();

  return {
    name: fullName,
    avatarInitial: getAvatarInitial(fullName),
    avatarTone: getAvatarTone(fullName),
    role: roleByRelationship[relationship],
    status,
  };
}

function compareParentNames(first: ParentLink, second: ParentLink): number {
  return first.name.localeCompare(second.name, "es");
}

function calculateAge(birthDate: string): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  const today = new Date();
  const hasBirthdayPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);

  return today.getFullYear() - year - (hasBirthdayPassed ? 0 : 1);
}

function formatBirthDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return `${day} ${spanishMonths[month - 1]} ${year}`;
}

function formatEnrollmentDate(date: string): string {
  const [year, month] = date.split("-").map(Number);

  return `${spanishMonths[month - 1]} ${year}`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

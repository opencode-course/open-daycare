"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/server/db/client";
import { createServiceClient } from "@/server/db/service-client";
import { requireUser } from "@/server/auth/session";
import {
  relationshipByRole,
  type ParentRole,
} from "@/features/kids/parent";
import { parseAllergyTags, validateAddKid } from "@/features/kids/schema";
import type {
  AddKidErrors,
  AddKidValues,
} from "@/features/kids/schema";

export type AddKidActionResult = {
  errors: AddKidErrors;
  formError?: string;
  success: boolean;
};

export type InviteParentValues = {
  childId: string;
  parentName: string;
  email: string;
  role: ParentRole;
};

export type InviteParentErrors = Partial<
  Record<"parentName" | "email" | "role", string>
>;

export type InviteParentActionResult = {
  errors: InviteParentErrors;
  formError?: string;
  code?: string;
  success: boolean;
};

const invitationCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const invitationCodeLength = 5;
const invitationCodeAttempts = 5;
const invitationLifetimeDays = 7;
const inviteParentFormError =
  "No se pudo enviar la invitación. Intentá de nuevo.";

export async function inviteParentAction(
  input: InviteParentValues,
): Promise<InviteParentActionResult> {
  const user = await requireUser();

  if (user.role !== "staff" && user.role !== "admin") {
    return {
      errors: {},
      formError: "No tenés permiso para enviar invitaciones.",
      success: false,
    };
  }

  if (!isInviteParentValues(input)) {
    return { errors: {}, formError: inviteParentFormError, success: false };
  }

  const errors = validateInviteParent(input);

  if (Object.values(errors).some(Boolean)) {
    return { errors, success: false };
  }

  if (!isUuid(input.childId)) {
    return { errors: {}, formError: inviteParentFormError, success: false };
  }

  const parentName = input.parentName.trim();
  const email = input.email.trim().toLowerCase();

  try {
    const userClient = await createClient();
    const { data: child, error: childError } = await userClient
      .from("children")
      .select("id")
      .eq("id", input.childId)
      .maybeSingle();

    if (childError || !child) {
      return { errors: {}, formError: inviteParentFormError, success: false };
    }

    const serviceClient = createServiceClient();
    const { error: cancelError } = await serviceClient
      .from("invitations")
      .update({ status: "cancelled" })
      .eq("child_id", child.id)
      .eq("email", email)
      .eq("status", "pending");

    if (cancelError) {
      return { errors: {}, formError: inviteParentFormError, success: false };
    }

    for (let attempt = 0; attempt < invitationCodeAttempts; attempt += 1) {
      const code = generateInvitationCode();
      const expiresAt = new Date(
        Date.now() + invitationLifetimeDays * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { error: insertError } = await serviceClient
        .from("invitations")
        .insert({
          child_id: child.id,
          invited_by: user.id,
          full_name: parentName,
          email,
          relationship: relationshipByRole[input.role],
          code,
          expires_at: expiresAt,
        });

      if (!insertError) {
        revalidatePath("/kids");
        revalidatePath(`/kids/${child.id}`);

        return { errors: {}, code, success: true };
      }

      if (insertError.code !== "23505") {
        return { errors: {}, formError: inviteParentFormError, success: false };
      }
    }
  } catch {
    return { errors: {}, formError: inviteParentFormError, success: false };
  }

  return { errors: {}, formError: inviteParentFormError, success: false };
}

export async function addKidAction(
  input: AddKidValues,
): Promise<AddKidActionResult> {
  if (!isAddKidValues(input)) {
    return {
      errors: {},
      formError: "No se pudo guardar el niño. Revisá los datos e intentá de nuevo.",
      success: false,
    };
  }

  const errors = validateAddKid(input);

  if (Object.values(errors).some(Boolean)) {
    return { errors, success: false };
  }

  const user = await requireUser();

  if (user.role !== "staff" && user.role !== "admin") {
    return {
      errors: {},
      formError: "No tenés permiso para agregar niños.",
      success: false,
    };
  }

  if (!isUuid(input.classroom)) {
    return {
      errors: { classroom: "Elegí una sala" },
      success: false,
    };
  }

  const supabase = await createClient();
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", input.classroom)
    .maybeSingle();

  if (roomError) {
    return {
      errors: {},
      formError: "No se pudo guardar el niño. Intentá de nuevo.",
      success: false,
    };
  }

  if (!room) {
    return {
      errors: { classroom: "Elegí una sala" },
      success: false,
    };
  }

  const { error: insertError } = await supabase.from("children").insert({
    room_id: room.id,
    full_name: input.name.trim(),
    birth_date: toDatabaseDate(input.birthDate),
    enrolled_at: new Date().toISOString().slice(0, 10),
    medical_notes: input.notes.trim() || null,
    allergy_tags: parseAllergyTags(input.allergies),
  });

  if (insertError) {
    return {
      errors: {},
      formError: "No se pudo guardar el niño. Intentá de nuevo.",
      success: false,
    };
  }

  revalidatePath("/kids");

  return { errors: {}, success: true };
}

function isAddKidValues(input: unknown): input is AddKidValues {
  if (typeof input !== "object" || input === null) {
    return false;
  }

  const values = input as Record<string, unknown>;

  return ["name", "birthDate", "classroom", "allergies", "notes"].every(
    (field) => typeof values[field] === "string",
  );
}

function isInviteParentValues(input: unknown): input is InviteParentValues {
  if (typeof input !== "object" || input === null) {
    return false;
  }

  const values = input as Record<string, unknown>;

  return ["childId", "parentName", "email", "role"].every(
    (field) => typeof values[field] === "string",
  );
}

function validateInviteParent(values: InviteParentValues): InviteParentErrors {
  const email = values.email.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validRole = Object.hasOwn(relationshipByRole, values.role);

  return {
    parentName: values.parentName.trim()
      ? undefined
      : "Ingresá el nombre del padre o madre",
    email: !email
      ? "Ingresá el email"
      : validEmail
        ? undefined
        : "El email no es válido",
    role: validRole ? undefined : "Elegí el parentesco",
  };
}

function generateInvitationCode(): string {
  return Array.from({ length: invitationCodeLength }, () =>
    invitationCodeAlphabet.charAt(randomInt(invitationCodeAlphabet.length)),
  ).join("");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function toDatabaseDate(value: string): string {
  const [day, month, year] = value.split("/");

  return `${year}-${month}-${day}`;
}

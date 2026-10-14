"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/server/db/client";
import { requireUser } from "@/server/auth/session";
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function toDatabaseDate(value: string): string {
  const [day, month, year] = value.split("/");

  return `${year}-${month}-${day}`;
}

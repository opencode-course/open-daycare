"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/server/db/client";
import { createServiceClient } from "@/server/db/service-client";
import {
  validateActivation,
  validateLogin,
  type ActivationFieldErrors,
  type LoginFieldErrors,
} from "./schema";
import type { RelationshipType } from "@/features/kids/parent";

export type LoginState = {
  errors: LoginFieldErrors;
  formError?: string;
};

export type ActivationState = {
  errors: ActivationFieldErrors;
  formError?: string;
};

export type InvitationPreview = {
  childName: string;
  roomName: string;
} | null;

type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

type ActivationInvitation = {
  id: string;
  child_id: string;
  full_name: string;
  email: string;
  relationship: RelationshipType;
  status: InvitationStatus;
  expires_at: string;
};

type ActivationChild = {
  id: string;
  room: { daycare_id: string } | { daycare_id: string }[] | null;
};

type InvitationPreviewChild = {
  full_name: string;
  room: { name: string } | { name: string }[] | null;
};

type InvitationPreviewRow = {
  child: InvitationPreviewChild | InvitationPreviewChild[] | null;
};

const invalidInvitationCodeMessage = "El código no es válido";
const expiredInvitationMessage = "La invitación venció. Pedí una nueva.";
const activationFormError = "No se pudo activar la cuenta. Intentá de nuevo.";
const validInvitationCode = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const errors = validateLogin({ email, password });

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      errors: {},
      formError: "Email o contraseña incorrectos.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/auth/login");
}

export async function activateAccountAction(
  _previousState: ActivationState,
  formData: FormData,
): Promise<ActivationState> {
  const codeValue = formData.get("code");
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const code = typeof codeValue === "string" ? codeValue : "";
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const errors = validateActivation({ code, email, password });

  if (Object.values(errors).some(Boolean)) {
    return { errors };
  }

  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = email.toLowerCase();
  let activatedChildId: string | undefined;

  try {
    const serviceClient = createServiceClient();
    const { data: invitationData, error: invitationError } = await serviceClient
      .from("invitations")
      .select("id, child_id, full_name, email, relationship, status, expires_at")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (invitationError) {
      return { errors: {}, formError: activationFormError };
    }

    const invitation = invitationData as ActivationInvitation | null;

    if (!invitation || invitation.status === "cancelled") {
      return { errors: { code: invalidInvitationCodeMessage } };
    }

    if (invitation.status === "accepted") {
      return { errors: { code: "Este código ya fue usado." } };
    }

    if (invitation.status === "expired") {
      return { errors: { code: expiredInvitationMessage } };
    }

    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      const { error: expireError } = await serviceClient
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id)
        .eq("status", "pending");

      if (expireError) {
        return { errors: {}, formError: activationFormError };
      }

      return { errors: { code: expiredInvitationMessage } };
    }

    if (normalizedEmail !== invitation.email.toLowerCase()) {
      return {
        errors: { email: "El email no coincide con la invitación." },
      };
    }

    const { data: childData, error: childError } = await serviceClient
      .from("children")
      .select("id, room:rooms(daycare_id)")
      .eq("id", invitation.child_id)
      .maybeSingle();

    const child = childData as ActivationChild | null;
    const room = Array.isArray(child?.room) ? child.room[0] : child?.room;

    if (childError || !child || !room?.daycare_id) {
      return { errors: {}, formError: activationFormError };
    }

    const { data: authData, error: createUserError } =
      await serviceClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      });

    if (createUserError) {
      if (createUserError.code === "weak_password") {
        return {
          errors: {
            password: "La contraseña no cumple los requisitos de seguridad.",
          },
        };
      }

      if (isExistingAccountError(createUserError.code, createUserError.message)) {
        return {
          errors: {},
          formError: "Ya existe una cuenta con este email. Iniciá sesión.",
        };
      }

      return { errors: {}, formError: activationFormError };
    }

    const authUserId = authData.user?.id;

    if (!authUserId) {
      return { errors: {}, formError: activationFormError };
    }

    const { error: profileError } = await serviceClient.from("users").insert({
      id: authUserId,
      daycare_id: room.daycare_id,
      full_name: invitation.full_name,
      role: "parent",
    });

    if (profileError) {
      return { errors: {}, formError: activationFormError };
    }

    const { error: linkError } = await serviceClient
      .from("parent_children")
      .insert({
        parent_id: authUserId,
        child_id: child.id,
        relationship: invitation.relationship,
      });

    if (linkError) {
      return { errors: {}, formError: activationFormError };
    }

    const { error: consentError } = await serviceClient
      .from("children")
      .update({ photo_consent: formData.get("photoConsent") === "on" })
      .eq("id", child.id);

    if (consentError) {
      return { errors: {}, formError: activationFormError };
    }

    const { data: acceptedInvitation, error: acceptError } =
      await serviceClient
        .from("invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

    if (acceptError || !acceptedInvitation) {
      return { errors: {}, formError: activationFormError };
    }

    activatedChildId = child.id;
  } catch {
    return { errors: {}, formError: activationFormError };
  }

  if (!activatedChildId) {
    return { errors: {}, formError: activationFormError };
  }

  revalidatePath("/");
  revalidatePath("/kids");
  revalidatePath(`/kids/${activatedChildId}`);

  try {
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      return { errors: {}, formError: activationFormError };
    }
  } catch {
    return { errors: {}, formError: activationFormError };
  }

  redirect("/");
}

export async function checkInvitationCodeAction(
  code: string,
): Promise<InvitationPreview> {
  const normalizedCode = typeof code === "string" ? code.trim().toUpperCase() : "";

  if (!validInvitationCode.test(normalizedCode)) {
    return null;
  }

  try {
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from("invitations")
      .select("child:children(full_name, room:rooms(name))")
      .eq("code", normalizedCode)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as InvitationPreviewRow;
    const child = Array.isArray(row.child) ? row.child[0] : row.child;
    const room = Array.isArray(child?.room) ? child.room[0] : child?.room;

    if (!child || !room) {
      return null;
    }

    return { childName: child.full_name.trim(), roomName: room.name };
  } catch {
    return null;
  }
}

function isExistingAccountError(code: string | undefined, message: string): boolean {
  return (
    code === "email_exists" ||
    /already registered|already exists/i.test(message)
  );
}

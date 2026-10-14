import { createServerClient } from "@supabase/ssr";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/server/db/client";
import { getSupabaseConfig } from "@/shared/lib/supabase-env";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  initials: string;
  role: "staff" | "parent" | "admin";
  daycareName: string;
};

export const userRoleLabels: Record<SessionUser["role"], string> = {
  staff: "Staff",
  parent: "Familia",
  admin: "Admin",
};

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("full_name, role, daycares(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const daycare = Array.isArray(profile?.daycares)
    ? profile.daycares[0]
    : profile?.daycares;

  if (!profile || !daycare) {
    return null;
  }

  const fullName = profile.full_name.trim();
  const firstName = fullName.split(/\s+/)[0] ?? "";

  return {
    id: user.id,
    email: user.email,
    fullName,
    firstName,
    initials: firstName.charAt(0).toUpperCase(),
    role: profile.role,
    daycareName: daycare.name,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { canOpenRoleArea, getRoleLandingPath } from "@/lib/auth/permissions";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";
import type { AppRole } from "@/types/domain";

type ProxyProfile = {
  role: AppRole;
  status: "active" | "inactive";
};

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicEnv();
  const pathname = request.nextUrl.pathname;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    (pathname.startsWith("/admin") || pathname.startsWith("/teacher"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/login") {
    const { data } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("user_id", user.id)
      .single();
    const profile = data as unknown as ProxyProfile | null;

    if (profile?.status === "active") {
      return NextResponse.redirect(
        new URL(getRoleLandingPath(profile.role), request.url),
      );
    }
  }

  if (
    user &&
    (pathname.startsWith("/admin") || pathname.startsWith("/teacher"))
  ) {
    const { data } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("user_id", user.id)
      .single();
    const profile = data as unknown as ProxyProfile | null;

    if (!profile || profile.status !== "active") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!canOpenRoleArea(profile.role, pathname)) {
      return NextResponse.redirect(
        new URL(getRoleLandingPath(profile.role), request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/login"],
};

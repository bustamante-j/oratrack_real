import { getSupabasePublicEnv } from "@/lib/env";

export function getAvatarUrl(path: string | null) {
  const { url } = getSupabasePublicEnv();

  if (!path || !url) return null;

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  return `${url}/storage/v1/object/public/avatars/${encodedPath}`;
}

import "server-only";

type ServerEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  adminPassword: string;
  sessionSecret: string;
  siteUrl: string | null;
};

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? null;

  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
    ["SUPABASE_SERVICE_ROLE_KEY", supabaseServiceRoleKey],
    ["ADMIN_PASSWORD", adminPassword],
    ["SESSION_SECRET", sessionSecret],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Konfigurasi server belum lengkap. Isi variabel berikut: ${missing.join(", ")}.`,
    );
  }

  if (sessionSecret!.length < 32) {
    throw new Error("SESSION_SECRET harus memiliki panjang minimal 32 karakter.");
  }

  cachedEnv = {
    supabaseUrl: supabaseUrl!,
    supabaseServiceRoleKey: supabaseServiceRoleKey!,
    adminPassword: adminPassword!,
    sessionSecret: sessionSecret!,
    siteUrl,
  };

  return cachedEnv;
}

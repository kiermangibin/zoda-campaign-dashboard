import { checkSupabaseConnection } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const status = await checkSupabaseConnection();

  return Response.json(status, {
    status: status.connected || !status.configured ? 200 : 503
  });
}

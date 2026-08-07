import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type SupabaseConnectionStatus = {
  configured: boolean;
  connected: boolean;
  message: string;
  projectRef?: string;
};

export function getSupabaseProjectRef() {
  if (!supabaseUrl) return undefined;

  try {
    return new URL(supabaseUrl).hostname.split(".")[0];
  } catch {
    return undefined;
  }
}

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const projectRef = getSupabaseProjectRef();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return {
      configured: false,
      connected: false,
      projectRef,
      message: "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect."
    };
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      configured: false,
      connected: false,
      projectRef,
      message: "Supabase client could not be created."
    };
  }

  try {
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
      return {
        configured: true,
        connected: false,
        projectRef,
        message: error.message
      };
    }

    return {
      configured: true,
      connected: true,
      projectRef,
      message: "Supabase service role connection verified."
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      projectRef,
      message: error instanceof Error ? error.message : "Supabase connection failed."
    };
  }
}

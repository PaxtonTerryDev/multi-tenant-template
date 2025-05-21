import { createClient } from "@supabase/supabase-js";
import { Database } from "../database.types";

/**
 * TESTING ONLY
 * Creates a service role account that can be used to interact with all tables. This should not be used in any server side code, only for testing.
 * @returns Supabase Client with Service Role Priveledges
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

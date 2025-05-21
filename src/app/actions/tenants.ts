"use server";

import { TenantRegistration } from "@/components/tenant-registration-form";
import { Tenant } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export async function createTenant(
  tenantData: TenantRegistration,
  client?: SupabaseClient
): Promise<Tenant> {
  const supabase = client ?? (await createClient());
  const { name, subdomain } = tenantData;
  const { data, error } = await supabase
    .from("tenants")
    .insert({ name, subdomain })
    .select();

  if (error) {
    throw new Error(`Could not create tenant: ${error.message}`);
  }

  return data[0];
}

"use server";

import { UserProfile } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  DatabaseOperationResult,
  handleDatabaseOperationResult,
  updateById,
  UpdateInput,
} from "./database";

type UserInsert = Partial<Omit<UserProfile, "id">> & { id: string };

export async function createUser(
  data: UserInsert,
  client?: SupabaseClient
): Promise<DatabaseOperationResult<UserProfile>> {
  const supabase = client ?? (await createClient());
  const { id, ...values } = data;

  const { data: insertData, error } = await supabase
    .from("user_profiles")
    .insert({ id, values })
    .select()
    .single();

  return handleDatabaseOperationResult<UserProfile>(insertData, error);
}

export async function updateUser(
  data: UpdateInput<UserProfile>,
  client?: SupabaseClient
): Promise<DatabaseOperationResult<UserProfile>> {
  const supabase = client ?? (await createClient());
  return await updateById<UserProfile>("user_profiles", data, supabase);
}

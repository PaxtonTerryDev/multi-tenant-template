import { Database, Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export type DatabaseOperationResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

export type UpdateInput<T> = Partial<Omit<T, "id">> & { id: string };

export async function updateById<T extends { id: string }>(
  table: keyof Database["public"]["Tables"],
  input: UpdateInput<T>,
  client?: SupabaseClient
): Promise<DatabaseOperationResult<T>> {
  const supabase = client ?? (await createClient());
  const { id, ...values } = input;

  const { data, error } = await supabase
    .from(table)
    .update(values)
    .eq("id", id)
    .select()
    .single();

  return handleDatabaseOperationResult<T>(data, error);
}

export function handleDatabaseOperationResult<T>(
  data: T,
  error: PostgrestError | null
): DatabaseOperationResult<T> {
  if (error || !data) {
    return {
      data: null,
      error: error ?? new Error("Unknown error during update"),
    };
  }

  return {
    data: data as T,
    error: null,
  };
}

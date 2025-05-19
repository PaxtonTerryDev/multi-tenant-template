"use server";
import { createClient } from "@/lib/supabase/server";
import { EmailRegistration } from "@/components/user-registration-form";
import { EmailLogin } from "@/components/login-form";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function emailLogin(data: EmailLogin) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function submitEmailRegistration(data: EmailRegistration) {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp(data);

  if (authData && authData.user) {
    const { error: insertError } = await supabase
      .from("user_profiles")
      .insert({ id: authData.user?.id, email: "email" })
      .select();

    if (insertError) {
      throw new Error("Error creating user profile.");
    }
  }

  if (authError) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  let { error } = await supabase.auth.signOut();
  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

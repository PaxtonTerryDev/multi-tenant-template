"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export function homeRedirect(revalidate: boolean = true) {
  if (revalidate) revalidatePath("/", "layout");
  redirect("/");
}

export function errorRedirect() {
  redirect("/error");
}

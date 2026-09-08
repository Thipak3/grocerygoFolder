"use server"

import { signIn } from "@/auth"

export async function loginWithGoogle() {
  const url = await signIn("google", { redirect: false, redirectTo: "/" })
  return url
}

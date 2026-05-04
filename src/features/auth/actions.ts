"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type ActionState = { error: string } | null;

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos" };
    }
    // redirect() lanza un error especial — hay que re-lanzarlo
    throw error;
  }

  return null;
}

export async function register(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });

  if (existing) {
    return { error: "El email ya está registrado" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  redirect("/login");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

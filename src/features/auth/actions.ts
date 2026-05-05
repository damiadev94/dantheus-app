"use server";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
type ActionState = { error: string } | null;

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // * 1. Validar
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Email o contraseña incorrectos" };
    // ! redirect() lanza un error especial — hay que re-lanzarlo para que Next.js lo procese
    throw error;
  }

  return null;
}

export async function register(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // * 1. Validar
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password } = parsed.data;

  // * 2. Verificar unicidad
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  if (existing) return { error: "El email ya está registrado" };

  // * 3. Crear usuario
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash },
  });

  redirect("/login");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

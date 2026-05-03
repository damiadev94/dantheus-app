"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { LoginInput, RegisterInput } from "./types";

export async function login(input: LoginInput) {
  // TODO: validate credentials with NextAuth signIn
  redirect("/");
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("El email ya está registrado");
  }

  // TODO: hash password with bcrypt before storing
  await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.password,
      name: input.name,
    },
  });

  redirect("/login");
}

export async function logout() {
  // TODO: NextAuth signOut
  redirect("/login");
}

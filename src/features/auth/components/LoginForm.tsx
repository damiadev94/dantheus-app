"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, null);

  return (
    <form action={action} className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>

      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="tu@email.com"
          required
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-black py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        ¿No tenés cuenta?{" "}
        <a href="/register" className="font-medium underline">
          Registrarse
        </a>
      </p>
    </form>
  );
}

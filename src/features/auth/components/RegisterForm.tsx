"use client";

import { useActionState } from "react";
import { register } from "../actions";

export function RegisterForm() {
  const [state, action, isPending] = useActionState(register, null);

  return (
    <form action={action} className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>

      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Tu nombre"
          required
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

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
        {isPending ? "Creando cuenta…" : "Registrarse"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        ¿Ya tenés cuenta?{" "}
        <a href="/login" className="font-medium underline">
          Iniciar sesión
        </a>
      </p>
    </form>
  );
}

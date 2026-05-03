"use client";

export function RegisterForm() {
  return (
    <form className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <input
        type="text"
        name="name"
        placeholder="Nombre"
        required
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        required
        className="w-full rounded border px-3 py-2"
      />
      <button
        type="submit"
        className="w-full rounded bg-black py-2 text-white"
      >
        Registrarse
      </button>
    </form>
  );
}

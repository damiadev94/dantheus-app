"use client";

export function ProjectForm() {
  return (
    <form className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Nombre del proyecto"
        required
        className="w-full rounded border px-3 py-2"
      />
      <button type="submit" className="rounded bg-black px-4 py-2 text-white">
        Crear proyecto
      </button>
    </form>
  );
}

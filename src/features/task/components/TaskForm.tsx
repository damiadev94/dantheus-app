"use client";

export function TaskForm() {
  return (
    <form className="space-y-3">
      <input
        type="text"
        name="title"
        placeholder="Nueva tarea"
        required
        className="w-full rounded border px-3 py-2 text-sm"
      />
      <button type="submit" className="rounded bg-black px-3 py-1.5 text-sm text-white">
        Agregar
      </button>
    </form>
  );
}

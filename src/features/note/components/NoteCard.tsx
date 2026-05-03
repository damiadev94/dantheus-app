import type { Note } from "../types";

type Props = { note: Note };

export function NoteCard({ note }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{note.title}</h3>
      <span className="text-xs text-gray-400">{note.type}</span>
    </div>
  );
}

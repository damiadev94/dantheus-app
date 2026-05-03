import type { Note } from "../types";
import { NoteCard } from "./NoteCard";

type Props = { notes: Note[] };

export function NoteList({ notes }: Props) {
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

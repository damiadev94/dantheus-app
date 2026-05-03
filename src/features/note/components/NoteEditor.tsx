"use client";

type Props = {
  initialTitle?: string;
  initialContent?: unknown;
  onSave?: (title: string, content: unknown) => void;
};

export function NoteEditor({ initialTitle = "", onSave }: Props) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        defaultValue={initialTitle}
        placeholder="Título"
        className="w-full border-b pb-2 text-xl font-semibold outline-none"
      />
      <div
        className="min-h-[200px] rounded border p-3 text-sm"
        contentEditable
        suppressContentEditableWarning
      />
    </div>
  );
}

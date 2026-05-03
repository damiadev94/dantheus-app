"use client";

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
};

export function DatePicker({ name, defaultValue, label }: Props) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type="date"
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </div>
  );
}

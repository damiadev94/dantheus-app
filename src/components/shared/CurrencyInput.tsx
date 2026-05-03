"use client";

type Props = {
  name: string;
  defaultValue?: number;
  currency?: string;
  placeholder?: string;
};

export function CurrencyInput({
  name,
  defaultValue,
  currency = "ARS",
  placeholder = "0.00",
}: Props) {
  return (
    <div className="flex rounded border focus-within:ring-1">
      <span className="flex items-center bg-gray-50 px-3 text-sm text-gray-500">
        {currency}
      </span>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step="0.01"
        min="0"
        className="flex-1 rounded-r px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}

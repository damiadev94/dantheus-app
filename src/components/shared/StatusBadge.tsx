type Props = {
  status: string;
  variant?: "default" | "success" | "warning" | "danger";
};

const variants: Record<string, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
};

export function StatusBadge({ status, variant = "default" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {status}
    </span>
  );
}

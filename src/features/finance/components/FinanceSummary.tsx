import type { MonthlySummary } from "../types";
import { formatCurrency } from "@/lib/utils";

type Props = { summary: MonthlySummary; currency: string };

export function FinanceSummary({ summary, currency }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-gray-500">Ingresos</p>
        <p className="text-xl font-bold text-green-600">
          {formatCurrency(summary.income, currency)}
        </p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-gray-500">Gastos</p>
        <p className="text-xl font-bold text-red-600">
          {formatCurrency(summary.expenses, currency)}
        </p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-gray-500">Ahorro</p>
        <p className="text-xl font-bold">
          {formatCurrency(summary.savings, currency)}
        </p>
      </div>
    </div>
  );
}

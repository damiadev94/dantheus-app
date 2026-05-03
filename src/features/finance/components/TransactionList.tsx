import type { Transaction } from "../types";
import { formatCurrency } from "@/lib/utils";

type Props = { transactions: Transaction[] };

export function TransactionList({ transactions }: Props) {
  return (
    <ul className="divide-y">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">{t.description ?? t.type}</p>
            <p className="text-xs text-gray-400">
              {new Date(t.date).toLocaleDateString("es-AR")}
            </p>
          </div>
          <span
            className={
              t.type === "INCOME" ? "text-green-600" : "text-red-600"
            }
          >
            {t.type === "INCOME" ? "+" : "-"}
            {formatCurrency(t.amount, t.currency)}
          </span>
        </li>
      ))}
    </ul>
  );
}

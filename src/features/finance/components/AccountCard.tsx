import type { Account } from "../types";
import { formatCurrency } from "@/lib/utils";

type Props = { account: Account };

export function AccountCard({ account }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{account.name}</h3>
      <p className="text-sm text-gray-500">{account.type}</p>
      <p className="mt-2 text-lg font-bold">
        {formatCurrency(account.currentBalance, account.currency)}
      </p>
    </div>
  );
}

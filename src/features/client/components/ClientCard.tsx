import type { Client } from "../types";

type Props = { client: Client };

export function ClientCard({ client }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{client.name}</h3>
      {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
    </div>
  );
}

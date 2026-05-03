import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const executed = await prisma.transaction.updateMany({
    where: {
      status: "SCHEDULED",
      date: { lte: today },
    },
    data: { status: "EXECUTED" },
  });

  return NextResponse.json({ executed: executed.count });
}

import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { db } from "@/prisma/db";

export const GET = async () => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [pending, confirmed, recentBills] = await Promise.all([
    db.orm.public.Bill.where({
      userId: session.user.id,
      status: "PENDING_REVIEW",
    }).aggregate((bill) => ({ count: bill.count() })),
    db.orm.public.Bill.where({
      userId: session.user.id,
      status: "CONFIRMED",
    }).aggregate((bill) => ({ count: bill.count() })),
    db.orm.public.Bill.where({ userId: session.user.id })
      .orderBy([(bill) => bill.createdAt.desc(), (bill) => bill.id.desc()])
      .limit(5)
      .all(),
  ]);

  return NextResponse.json({
    user: {
      name: session.user.name,
    },
    pending: pending.count,
    confirmed: confirmed.count,
    recentBills,
  });
};

import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/stylrs/email";

/// Bedoeld om periodiek (bv. elk uur) aangeroepen te worden door een externe
/// scheduler (Vercel Cron, cron-job.org, etc.) met header
/// `Authorization: Bearer <STYLRS_CRON_SECRET>`.
export async function GET(request: Request) {
  const secret = process.env.STYLRS_CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sent = await sendDueReminders();
  return NextResponse.json({ sent });
}

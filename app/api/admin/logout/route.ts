import { endSession } from "@/lib/admissions/auth";

export async function POST() {
  await endSession();
  return Response.json({ ok: true });
}

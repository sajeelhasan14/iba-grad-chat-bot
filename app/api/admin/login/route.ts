import { z } from "zod";
import { checkPassword, startSession } from "@/lib/admissions/auth";

export async function POST(request: Request) {
  const parsed = z.object({ password: z.string().max(200) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || !checkPassword(parsed.data.password)) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }
  await startSession();
  return Response.json({ ok: true });
}

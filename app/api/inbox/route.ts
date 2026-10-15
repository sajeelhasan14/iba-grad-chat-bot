import { takeInbox } from "@/lib/admissions/store";

// The chat asks every few seconds: "any messages for me?" (payment received, admission confirmed...).
// It's how the admin panel "sends WhatsApp messages" in this demo.
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!sessionId || sessionId.length > 100) return Response.json({ messages: [] });

  return Response.json({ messages: await takeInbox(sessionId) });
}

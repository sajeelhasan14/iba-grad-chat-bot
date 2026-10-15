import { MaxTurnsExceededError, assistant, run, user } from "@openai/agents";
import { z } from "zod";
import { ibagradsAgent } from "@/lib/agent";
import type { ChatContext } from "@/lib/chatContext";

// Only the latest messages are sent to the model, so long chats stay fast and cheap.
const HISTORY_LIMIT = 12;

// The browser sends the whole chat (we have no chat database). Validate it, since anyone can call this URL.
const bodySchema = z.object({
  sessionId: z.string().min(8).max(100),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(200)
    .refine((messages) => messages.at(-1)?.role === "user", "The last message must be from the user"),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const history = parsed.data.messages
    .slice(-HISTORY_LIMIT)
    .map((message) => (message.role === "user" ? user(message.text) : assistant(message.text)));

  // Tools read the session id from here, and may add a Pay button (payLink) for this reply.
  const context: ChatContext = { sessionId: parsed.data.sessionId };

  try {
    // 8 turns: an admission can take a few tool calls (course, batch, create) before the reply.
    const result = await run(ibagradsAgent, history, { maxTurns: 8, context });
    return Response.json({ reply: result.finalOutput ?? "", link: context.payLink ?? null });
  } catch (error) {
    console.error("[chat] agent run failed", error);

    const message =
      error instanceof MaxTurnsExceededError
        ? "That question needed too many steps. Please ask it in a simpler way."
        : "Sorry, I couldn't answer right now. Please try again, or call any IBAGRADS campus.";
    return Response.json({ error: message }, { status: 500 });
  }
}

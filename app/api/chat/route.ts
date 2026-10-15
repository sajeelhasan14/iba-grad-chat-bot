import { MaxTurnsExceededError, assistant, run, user } from "@openai/agents";
import { z } from "zod";
import { ibagradsAgent } from "@/lib/agent";

// Only the latest messages are sent to the model, so long chats stay fast and cheap.
const HISTORY_LIMIT = 12;

// The browser sends the whole chat (we have no database). Validate it, since anyone can call this URL.
const bodySchema = z.object({
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

  try {
    const result = await run(ibagradsAgent, history, { maxTurns: 6 });
    return Response.json({ reply: result.finalOutput ?? "" });
  } catch (error) {
    console.error("[chat] agent run failed", error);

    const message =
      error instanceof MaxTurnsExceededError
        ? "That question needed too many steps. Please ask it in a simpler way."
        : "Sorry, I couldn't answer right now. Please try again, or call any IBAGRADS campus.";
    return Response.json({ error: message }, { status: 500 });
  }
}

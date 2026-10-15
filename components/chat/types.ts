export type Side = "in" | "out"; // in = from IBAGRADS, out = from the student
export type Ticks = "sent" | "delivered" | "read";

export type ChatItem =
  | { kind: "chip"; id: string; variant: "date" | "notice"; text: string }
  | {
      kind: "message";
      id: string;
      side: Side;
      text: string;
      time: string;
      ticks?: Ticks; // only on the student's messages
      quote?: string; // the bot message a quick-reply button belonged to
      buttons?: string[]; // quick replies, like WhatsApp interactive buttons
      link?: { label: string; url: string }; // a link button, e.g. "💳 Pay Rs. 45,000"
    };

export type MessageItem = Extract<ChatItem, { kind: "message" }>;

export const isMessage = (item: ChatItem): item is MessageItem => item.kind === "message";

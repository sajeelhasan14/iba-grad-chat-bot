const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const esc = (text: string) => text.replace(/[&<>"']/g, (char) => ESCAPES[char]);

/**
 * WhatsApp formatting: *bold* _italic_ ~strike~ ```mono``` and auto-linked URLs.
 * Everything is escaped first, so only the tags added here can end up as HTML.
 * A few markdown habits of the model (**bold**, # headings, [text](url)) are converted too.
 */
export function formatWhatsApp(text: string): string {
  const src = text
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/^#{1,6}\s+(.+)$/gm, "*$1*")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1 $2");

  return src
    .split(/(https?:\/\/[^\s<]*[^\s<.,!?)\]'"])/g)
    .map((part, i) => {
      if (i % 2) return `<a href="${esc(part)}" target="_blank" rel="noopener">${esc(part)}</a>`;
      return esc(part)
        .replace(/```([^`]+?)```/g, "<code>$1</code>")
        .replace(/(^|[\s(>])\*(?!\s)([^*\n]+?)\*(?=$|[\s).,!?:;<])/gm, "$1<strong>$2</strong>")
        .replace(/(^|[\s(>])_(?!\s)([^_\n]+?)_(?=$|[\s).,!?:;<])/gm, "$1<em>$2</em>")
        .replace(/(^|[\s(>])~(?!\s)([^~\n]+?)~(?=$|[\s).,!?:;<])/gm, "$1<s>$2</s>");
    })
    .join("");
}

// First non-empty line without formatting marks, for previews and quotes.
export const plain = (text: string) =>
  text.replace(/[*_~`]/g, "").split("\n").find((line) => line.trim()) ?? "";

export const timeNow = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();

// crypto.randomUUID only exists on https/localhost; the fallback keeps phone testing over LAN working.
export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);

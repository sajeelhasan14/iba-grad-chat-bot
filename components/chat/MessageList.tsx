import { useEffect, useRef } from "react";
import { BUSINESS } from "./config";
import { formatWhatsApp, plain } from "./format";
import { Icon } from "./icons";
import type { ChatItem, MessageItem } from "./types";

type MessageListProps = {
  items: ChatItem[];
  onQuickReply: (text: string, quote: string) => void;
};

export function MessageList({ items, onQuickReply }: MessageListProps) {
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    setWallpaper(list);
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setWallpaper(list);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    requestAnimationFrame(() => list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" }));
  }, [items]);

  return (
    <section className="messages" ref={listRef}>
      {items.map((item, index) => {
        if (item.kind === "chip") {
          return (
            <div key={item.id} className={`chip ${item.variant}`}>
              {item.text}
            </div>
          );
        }
        // A bubble gets the little "tail" when it starts a new run of messages from one side.
        const previous = items[index - 1];
        const tail = previous?.kind !== "message" || previous.side !== item.side;
        return <MessageRow key={item.id} message={item} tail={tail} onQuickReply={onQuickReply} />;
      })}
    </section>
  );
}

type MessageRowProps = {
  message: MessageItem;
  tail: boolean;
  onQuickReply: (text: string, quote: string) => void;
};

function MessageRow({ message, tail, onQuickReply }: MessageRowProps) {
  const buttons = message.buttons ?? [];

  return (
    <div className={`row ${message.side}${tail ? " tail" : ""}`}>
      <div className={`bubble${buttons.length ? " interactive" : ""}`}>
        {message.quote && (
          <div className="quote">
            <div className="quote-name">{BUSINESS}</div>
            <div className="quote-text">{plain(message.quote)}</div>
          </div>
        )}
        <div className="content">
          <div className="text">
            {/* formatWhatsApp escapes the text first, so only its own tags become HTML. */}
            <span dangerouslySetInnerHTML={{ __html: formatWhatsApp(message.text) }} />
            <span className="spacer" />
          </div>
          <span className="meta">
            {message.time}
            {message.ticks && (
              <Icon id={message.ticks === "sent" ? "tick" : "ticks"} className={`tk${message.ticks === "read" ? " read" : ""}`} />
            )}
          </span>
        </div>
        {buttons.length > 0 && (
          <div className="actions">
            {buttons.map((title) => (
              <button key={title} className="action" onClick={() => onQuickReply(title, message.text)}>
                <Icon id="reply" />
                {title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Doodle wallpaper from the original demo: an SVG tile recoloured from the --doodle CSS variable.
function setWallpaper(element: HTMLElement) {
  const color = getComputedStyle(document.documentElement).getPropertyValue("--doodle").trim() || "#d8cfc3";
  const style = `stroke='${color}' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><g ${style}>
    <path d='M20 40c10-6 20-6 30 0v30c-10-6-20-6-30 0z M50 40c10-6 20-6 30 0v30c-10-6-20-6-30 0z'/>
    <path d='M120 30l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z'/>
    <path d='M190 40l25-12 25 12-25 12z M200 45v12c0 5 30 5 30 0v-12'/>
    <ellipse cx='270' cy='60' rx='12' ry='17' transform='rotate(30 270 60)'/><path d='M262 48c8 6 8 18 16 24'/>
    <path d='M30 130h40a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H48l-10 9v-9h-8a8 8 0 0 1-8-8v-18a8 8 0 0 1 8-8z'/>
    <circle cx='140' cy='140' r='18'/><path d='M132 136h.1 M148 136h.1 M131 147c5 6 13 6 18 0'/>
    <path d='M200 160l30-30 6 6-30 30-8 2z M224 136l6 6'/>
    <path d='M260 150c0-20 20-30 30-30 0 20-10 30-30 30z M260 150l18-18'/>
    <path d='M30 225h30v30H30z M36 235h18 M36 243h12'/>
    <path d='M110 220h44l-6 50h-32z M108 220h48 M126 220l6-14'/>
    <path d='M205 230a20 20 0 1 0 40 0 20 20 0 1 0-40 0 M225 216v14l9 6'/>
    <path d='M275 260l8-16 8 16-8 16z'/>
    <circle cx='95' cy='85' r='4'/><circle cx='180' cy='190' r='4'/><circle cx='255' cy='205' r='3'/><circle cx='80' cy='190' r='3'/>
  </g></svg>`;
  element.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " "))}")`;
}

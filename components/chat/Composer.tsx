import { useEffect, useRef, useState } from "react";
import { EMOJIS } from "./config";
import { Icon } from "./icons";

type ComposerProps = {
  onSend: (text: string) => void;
  onDemo: () => void;
  onVoice: () => void;
};

export function Composer({ onSend, onDemo, onVoice }: ComposerProps) {
  // Starts with "Hi", like opening a wa.me link with a pre-filled message.
  const [value, setValue] = useState("Hi");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasText = value.trim().length > 0;

  // Grow the textarea with its content, up to 120px.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }, [value]);

  // On desktop, focus the input right away (on phones that would pop the keyboard up).
  useEffect(() => {
    if (matchMedia("(min-width: 761px)").matches) inputRef.current?.focus();
  }, []);

  // Clicking anywhere outside the emoji panel closes it.
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setEmojiOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  function submit() {
    const text = value.trim();
    if (!text) return;
    setValue("");
    setEmojiOpen(false);
    onSend(text);
    inputRef.current?.focus();
  }

  function insertEmoji(emoji: string) {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    setValue(value.slice(0, start) + emoji + value.slice(end));
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  return (
    <>
      <div className={`emoji-panel${emojiOpen ? " open" : ""}`} ref={panelRef}>
        {EMOJIS.map((emoji) => (
          <button key={emoji} type="button" onClick={() => insertEmoji(emoji)}>
            {emoji}
          </button>
        ))}
      </div>

      <footer className={`composer${hasText ? " has-text" : ""}`}>
        <div className="field">
          <button className="icon-btn desktop-only" title="Attach" onClick={onDemo}><Icon id="plus" /></button>
          <button
            className="icon-btn"
            title="Emoji"
            onClick={(event) => {
              event.stopPropagation();
              setEmojiOpen((open) => !open);
            }}
          >
            <Icon id="emoji" />
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            placeholder="Type a message"
            aria-label="Type a message"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter adds a new line (isComposing: don't send mid IME input).
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
          />
          <button className="icon-btn mobile-only" title="Attach" onClick={onDemo}><Icon id="clip" /></button>
          <button className="icon-btn mobile-only hide-when-typing" title="Camera" onClick={onDemo}><Icon id="camera" /></button>
        </div>
        <button className="send-btn" title="Send" onClick={() => (hasText ? submit() : onVoice())}>
          <Icon id="mic" className="ic ic-mic" />
          <Icon id="send" className="ic ic-send" />
        </button>
      </footer>
    </>
  );
}

import Image from "next/image";
import { useEffect, useState } from "react";
import { BUSINESS } from "./config";
import { Icon } from "./icons";

type ChatHeaderProps = {
  typing: boolean;
  onBack: () => void;
  onOpenInfo: () => void;
  onClear: () => void;
  onDemo: () => void;
};

export function ChatHeader({ typing, onBack, onOpenInfo, onClear, onDemo }: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Any click outside the menu closes it (clicks on menu items bubble here too).
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <header className="chat-header">
      <button className="icon-btn back mobile-only" title="Back" onClick={onBack}><Icon id="back" /></button>

      <button className="who" type="button" onClick={onOpenInfo}>
        <Image className="avatar" src="/avatar.svg" alt="" width={40} height={40} unoptimized />
        <div className="who-text">
          <div className="who-name">{BUSINESS}</div>
          <div className={`who-status${typing ? " typing" : ""}`}>{typing ? "typing…" : "Business account"}</div>
        </div>
      </button>

      <div className="icons">
        <button className="icon-btn mobile-only" title="Video call" onClick={onDemo}><Icon id="video" /></button>
        <button className="icon-btn mobile-only" title="Voice call" onClick={onDemo}><Icon id="call" /></button>
        <button className="icon-btn desktop-only" title="Search" onClick={onDemo}><Icon id="search" /></button>
        <div className="menu-wrap">
          <button
            className="icon-btn"
            title="Menu"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
          >
            <Icon id="more" />
          </button>
          <div className={`dropdown${menuOpen ? " open" : ""}`}>
            <button onClick={onOpenInfo}>Business info</button>
            <button onClick={onClear}>Clear chat</button>
          </div>
        </div>
      </div>
    </header>
  );
}

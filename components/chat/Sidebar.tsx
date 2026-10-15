import Image from "next/image";
import { BUSINESS, OTHER_CHATS } from "./config";
import { Icon } from "./icons";
import type { Ticks } from "./types";

type Preview = { text: string; time: string; ticks?: Ticks };

// Desktop navigation rail. Decorative: every button shows the "not available" toast.
export function Rail({ onDemo }: { onDemo: () => void }) {
  return (
    <nav className="rail">
      <div className="rail-top">
        <button className="rail-btn active" title="Chats">
          <Icon id="chats" />
          <span className="rail-badge">1</span>
        </button>
        <button className="rail-btn" title="Status" onClick={onDemo}><Icon id="status" /></button>
        <button className="rail-btn" title="Channels" onClick={onDemo}><Icon id="channels" /></button>
        <button className="rail-btn" title="Communities" onClick={onDemo}><Icon id="communities" /></button>
      </div>
      <div className="rail-bottom">
        <button className="rail-btn" title="Settings" onClick={onDemo}><Icon id="settings" /></button>
        <div className="rail-me"><Icon id="person" className="" /></div>
      </div>
    </nav>
  );
}

type SidebarProps = {
  preview: Preview;
  unread: number;
  onOpenChat: () => void;
  onDemo: () => void;
};

export function Sidebar({ preview, unread, onOpenChat, onDemo }: SidebarProps) {
  return (
    <aside className="sidebar">
      <header className="side-header">
        <h1>Chats</h1>
        <div className="icons">
          <button className="icon-btn mobile-only" title="Camera" onClick={onDemo}><Icon id="camera" /></button>
          <button className="icon-btn desktop-only" title="New chat" onClick={onDemo}><Icon id="newchat" /></button>
          <button className="icon-btn" title="Menu" onClick={onDemo}><Icon id="more" /></button>
        </div>
      </header>

      <div className="search">
        <Icon id="search" />
        <input placeholder="Search" aria-label="Search" />
      </div>
      <div className="pills">
        <span className="pill active">All</span>
        <span className="pill">Unread <b>1</b></span>
        <span className="pill">Favourites</span>
        <span className="pill">Groups</span>
      </div>

      <ul className="chat-list">
        <li className="chat-row active" onClick={onOpenChat}>
          <Image className="avatar" src="/avatar.svg" alt="" width={49} height={49} unoptimized />
          <div className="row-main">
            <div className="row-top">
              <div className="row-name"><span>{BUSINESS}</span></div>
              <span className={`row-time${unread ? " unread" : ""}`}>{preview.time}</span>
            </div>
            <div className="row-bottom">
              <div className="row-preview">
                {preview.ticks && (
                  <Icon id={preview.ticks === "sent" ? "tick" : "ticks"} className={`tk${preview.ticks === "read" ? " read" : ""}`} />
                )}
                <span>{preview.text}</span>
              </div>
              {unread > 0 && <span className="unread-badge">{unread}</span>}
            </div>
          </div>
        </li>

        {OTHER_CHATS.map(([name, text, time]) => (
          <li className="chat-row" key={name} onClick={onDemo}>
            <Icon id="person" className="ph" />
            <div className="row-main">
              <div className="row-top">
                <div className="row-name"><span>{name}</span></div>
                <span className="row-time">{time}</span>
              </div>
              <div className="row-bottom">
                <div className="row-preview"><span>{text}</span></div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="side-foot desktop-only">IBAGRADS Assistant · Demo</div>

      <button className="fab mobile-only" title="New chat" onClick={onDemo}><Icon id="newchat" /></button>
      <nav className="bottom-nav mobile-only">
        <span className="active"><i><Icon id="chats" /><b className="nav-badge">1</b></i>Chats</span>
        <span onClick={onDemo}><i><Icon id="status" /></i>Updates</span>
        <span onClick={onDemo}><i><Icon id="communities" /></i>Communities</span>
        <span onClick={onDemo}><i><Icon id="call" /></i>Calls</span>
      </nav>
    </aside>
  );
}

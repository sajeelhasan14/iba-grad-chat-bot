import Image from "next/image";
import { ACADEMY, LINKS } from "@/content/about";
import { BUSINESS } from "./config";
import { Icon } from "./icons";

export function InfoDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`drawer${open ? " open" : ""}`}>
      <header className="drawer-header">
        <button className="icon-btn" title="Close" onClick={onClose}><Icon id="close" /></button>
        <span>Business info</span>
      </header>
      <div className="drawer-body">
        <div className="card center">
          <Image className="avatar xl" src="/avatar.svg" alt="" width={200} height={200} unoptimized />
          <h2>{BUSINESS}</h2>
          <p className="muted">Business account</p>
        </div>
        <div className="card">
          <p>{ACADEMY.summary}</p>
        </div>
        <div className="card info-rows">
          <div><Icon id="store" /><span>Test preparation academy</span></div>
          <div><Icon id="chats" /><span>6 campuses in Karachi + online campus</span></div>
          <div><Icon id="open" /><a href={LINKS.website} target="_blank" rel="noopener">ibagrads.com</a></div>
          <div><Icon id="open" /><a href={LINKS.freeCounselling} target="_blank" rel="noopener">Book a free counselling session</a></div>
        </div>
        <div className="card muted small">IBAGRADS Assistant · Demo</div>
      </div>
    </aside>
  );
}

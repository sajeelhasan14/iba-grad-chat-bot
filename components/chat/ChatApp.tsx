"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { BUSINESS, INTRO, QUICK_REPLIES } from "./config";
import { newId, plain, timeNow } from "./format";
import { IconSprite } from "./icons";
import { InfoDrawer } from "./InfoDrawer";
import { MessageList } from "./MessageList";
import { Rail, Sidebar } from "./Sidebar";
import { isMessage, type ChatItem, type Ticks } from "./types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ChatApp() {
  // The chat lives only in the browser (no database). The ref always has the latest list,
  // so async code (waiting for the API) never works with an old copy of the state.
  const itemsRef = useRef<ChatItem[]>(INTRO);
  const [items, setItemsState] = useState<ChatItem[]>(INTRO);
  const updateItems = useCallback((change: (previous: ChatItem[]) => ChatItem[]) => {
    itemsRef.current = change(itemsRef.current);
    setItemsState(itemsRef.current);
  }, []);

  const [pending, setPending] = useState(0); // replies still being generated → "typing…"
  const [view, setView] = useState<"list" | "chat">("chat"); // which screen phones show
  const [unread, setUnread] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0); // changing it resets the composer
  const [toast, setToast] = useState({ text: "", show: false });

  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // Replies are handled one at a time, in order, like the original demo's queue.
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  // "Clear chat" bumps this, so a reply that arrives late for the old chat is ignored.
  const sessionRef = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((text: string) => {
    setToast({ text, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((current) => ({ ...current, show: false })), 2600);
  }, []);
  const showDemoToast = useCallback(() => showToast("Not available in this demo"), [showToast]);

  const setTicks = useCallback(
    (id: string, ticks: Ticks) =>
      updateItems((previous) => previous.map((item) => (item.kind === "message" && item.id === id ? { ...item, ticks } : item))),
    [updateItems],
  );

  const exchange = useCallback(
    async (outId: string, session: number) => {
      await sleep(250);
      if (session !== sessionRef.current) return;
      setTicks(outId, "read");
      setPending((count) => count + 1);

      try {
        // Send the conversation up to (and including) this message.
        const upToThis = itemsRef.current.slice(0, itemsRef.current.findIndex((item) => item.id === outId) + 1);
        const messages = upToThis.filter(isMessage).map((message) => ({
          role: message.side === "out" ? "user" : "assistant",
          text: message.text,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || typeof data.reply !== "string") {
          throw new Error(data.error ?? "Couldn't reach the assistant. Please try again.");
        }
        if (session !== sessionRef.current) return;

        const isFirstReply = !itemsRef.current.some((item) => isMessage(item) && item.side === "in");
        updateItems((previous) => [
          ...previous,
          {
            kind: "message",
            id: newId(),
            side: "in",
            text: data.reply,
            time: timeNow(),
            buttons: isFirstReply ? QUICK_REPLIES : undefined,
          },
        ]);
        if (viewRef.current === "list") setUnread((count) => count + 1);
      } catch (error) {
        if (session !== sessionRef.current) return;
        const text = error instanceof Error ? error.message : "Something went wrong.";
        updateItems((previous) => [...previous, { kind: "chip", id: newId(), variant: "notice", text: `⚠️ ${text}` }]);
      } finally {
        setPending((count) => Math.max(0, count - 1));
      }
    },
    [setTicks, updateItems],
  );

  const send = useCallback(
    (text: string, quote?: string) => {
      const id = newId();
      updateItems((previous) => [...previous, { kind: "message", id, side: "out", text, time: timeNow(), ticks: "sent", quote }]);
      setTimeout(() => setTicks(id, "delivered"), 150);
      const session = sessionRef.current;
      queueRef.current = queueRef.current.then(() => exchange(id, session));
    },
    [exchange, setTicks, updateItems],
  );

  const clearChat = useCallback(() => {
    sessionRef.current += 1;
    queueRef.current = Promise.resolve();
    setPending(0);
    setUnread(0);
    updateItems(() => INTRO);
    setChatKey((key) => key + 1);
  }, [updateItems]);

  // Escape closes the business info drawer.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const lastMessage = items.findLast(isMessage);
  const preview = lastMessage
    ? { text: plain(lastMessage.text), time: lastMessage.time, ticks: lastMessage.ticks }
    : { text: `Tap to chat with ${BUSINESS} 🎓`, time: "" };

  return (
    <>
      <IconSprite />
      <div className={`app view-${view}`}>
        <Rail onDemo={showDemoToast} />
        <Sidebar
          preview={preview}
          unread={unread}
          onOpenChat={() => {
            setView("chat");
            setUnread(0);
          }}
          onDemo={showDemoToast}
        />
        <main className="chat">
          <ChatHeader
            typing={pending > 0}
            onBack={() => setView("list")}
            onOpenInfo={() => setDrawerOpen(true)}
            onClear={clearChat}
            onDemo={showDemoToast}
          />
          <MessageList items={items} onQuickReply={send} />
          <Composer
            key={chatKey}
            onSend={send}
            onDemo={showDemoToast}
            onVoice={() => showToast("Voice messages aren't available in this demo")}
          />
          <InfoDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </main>
      </div>
      <div className={`toast${toast.show ? " show" : ""}`}>{toast.text}</div>
    </>
  );
}

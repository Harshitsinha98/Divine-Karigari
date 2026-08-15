"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919653043939";
const whatsappUrl = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! 👋 I'm your Divine Karigari assistant. I can help you find the perfect handcrafted gift, answer questions about products, shipping, or customization. How can I help you today?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Sorry, try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please try again or connect on WhatsApp.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-tulsi text-white shadow-lift transition-transform duration-300 hover:scale-105 hover:shadow-glow"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-20 right-5 z-50 flex w-[340px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-soft-2xl border border-sand-line bg-white shadow-lift-lg transition-all duration-300 sm:w-[380px] ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
        style={{ height: "min(520px, calc(100vh - 120px))" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-sand-line bg-tulsi px-4 py-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">
            🎁
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Divine Karigari</p>
            <p className="text-[11px] text-white/70">
              Gifting assistant &middot; Typically replies instantly
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-soft-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-tulsi text-white"
                      : "border border-sand-line bg-cream text-ink"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 rounded-soft-xl border border-sand-line bg-cream px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-ink [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-ink [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-ink [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottom} />
          </div>
        </div>

        {/* WhatsApp + input */}
        <div className="border-t border-sand-line">
          <a
            href={whatsappUrl(
              "Hi Divine Karigari! I'd like to speak with someone about my order/query.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-b border-sand-line bg-[#25D366]/10 px-4 py-2.5 text-xs font-medium text-[#128C7E] transition hover:bg-[#25D366]/20"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Chat on WhatsApp
          </a>
          <form onSubmit={send} className="flex gap-2 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              className="h-10 flex-1 rounded-full border border-sand-line bg-cream px-4 text-sm outline-none placeholder:text-muted-ink/60 focus:border-tulsi"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tulsi text-white transition hover:bg-tulsi-light disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

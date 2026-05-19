import { Bot, Send, X } from "lucide-react";
import { useMemo, useState } from "react";

const STARTER_MESSAGES = [
  {
    role: "assistant",
    text: "Welcome to Aura Stylist. Paste a product or pick a category and I will help with fit, colors, occasions, and finishing accessories.",
  },
];

function buildReply(message, category, style) {
  const text = message.toLowerCase();

  if (text.includes("color") || text.includes("match")) {
    return `${style} works well with a black, white, grey, or beige base. For ${category}, keep one hero color and use silver or matte accessories.`;
  }

  if (text.includes("formal") || text.includes("office")) {
    return "Go with a tailored blazer, crisp shirt, oxford shoes, and a silver watch. Navy + white is the safest premium pairing.";
  }

  if (text.includes("street") || text.includes("hoodie")) {
    return "Try an oversized hoodie, relaxed cargos, chunky sneakers, and a compact crossbody. Keep the palette black, grey, and one accent.";
  }

  if (text.includes("shoe") || text.includes("sneaker")) {
    return "For shoes, choose clean sneakers for casual/minimal looks, loafers for formal looks, and chunky sneakers for streetwear.";
  }

  if (text.includes("watch") || text.includes("accessory")) {
    return "A silver watch is strongest for formal/minimal outfits. Gold works for luxury looks, while matte black reads modern and versatile.";
  }

  return `For ${style} ${category}, I would build a balanced silhouette, choose a neutral base, add one premium accessory, and keep the fit clean rather than loud.`;
}

function AIChatPanel({ open, onClose, category, style, embedded = false }) {
  const [messages, setMessages] = useState(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const quickPrompts = useMemo(
    () => [
      `Style ${category}`,
      "Best colors?",
      "Office outfit",
      "Accessories",
    ],
    [category]
  );

  const sendMessage = (messageText = input) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: buildReply(trimmed, category, style),
        },
      ]);
      setTyping(false);
    }, 650);
  };

  const panelClassName = embedded
    ? "flex min-h-[560px] w-full flex-col rounded-[28px] border border-white/10 bg-zinc-950/80 shadow-2xl shadow-black/20"
    : `fixed inset-x-0 bottom-0 z-30 flex h-[78vh] w-full transform flex-col rounded-t-[28px] border border-cyan-300/15 bg-zinc-950/95 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl transition duration-300 sm:inset-x-auto sm:inset-y-4 sm:right-4 sm:h-[calc(100vh-2rem)] sm:max-w-sm sm:rounded-[28px] ${
        open
          ? "translate-y-0 opacity-100 sm:translate-x-0"
          : "translate-y-full opacity-0 sm:translate-x-full sm:translate-y-0"
      }`;

  const Wrapper = embedded ? "section" : "aside";

  return (
    <Wrapper
      className={panelClassName}
      aria-hidden={!embedded && !open}
    >
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-black">
            <Bot size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Aura Stylist
            </p>
            <h2 className="text-xl font-black">Real-time styling powered by AI</h2>
          </div>
        </div>

        {!embedded && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-cyan-300/40 hover:text-white"
            aria-label="Close AI assistant"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm font-semibold leading-6 ${
                message.role === "user"
                  ? "bg-cyan-300 text-black"
                  : "border border-white/10 bg-white/[0.04] text-gray-100"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-cyan-300">
              Aura is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-gray-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            placeholder="Ask Aura for styling advice..."
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-300/50"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            className="rounded-2xl bg-cyan-300 px-4 text-black transition hover:bg-white"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </Wrapper>
  );
}

export default AIChatPanel;

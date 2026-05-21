import { Bot, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { fetchAssistantReply } from "../services/api";

const STARTER_MESSAGES = [
  {
    role: "assistant",
    text: "Welcome to Aura Stylist. Paste a product or pick a category and I will help with fit, colors, occasions, and finishing accessories.",
  },
];

function buildReply(message, category, style) {
  const text = message.toLowerCase();
  const categoryAdvice = {
    Shirts: "For shirts, prioritize shoulder line, collar shape, and whether the hem can be tucked cleanly.",
    Hoodies: "For hoodies, watch volume: oversized works best when the pants or shoes create balance.",
    Glasses: "For glasses, frame width should follow your face width, with color kept close to your outfit palette.",
    Shoes: "For shoes, match visual weight: sleek outfits need slimmer shoes, streetwear can carry chunkier soles.",
    Watches: "For watches, metal tone matters most: silver feels clean, gold feels luxury, black feels modern.",
  };
  const styleAdvice = {
    Casual: "Keep the base easy: relaxed shirt or tee, straight denim, clean sneakers, and one simple accessory.",
    Streetwear: "Use volume intentionally: oversized top, relaxed pants, chunky sneakers, and a tight color palette.",
    Luxury: "Choose richer textures, minimal branding, polished shoes, and black/cream/silver or muted gold tones.",
    Minimal: "Stay monochrome or neutral, reduce visible logos, and let fit quality do the work.",
    Party: "Use black as the base, add one statement texture, and finish with silver or maroon accents.",
    Formal: "Lean on structure: crisp shirt, blazer, tailored trousers, oxford or loafer, and a silver watch.",
  };

  if (text.includes("interview")) {
    return "Interview look: navy or charcoal blazer, crisp white or light blue shirt, tailored trousers, dark belt, oxford shoes, and a silver watch. Keep colors low-contrast and avoid loud logos so the silhouette feels confident and professional.";
  }

  if (text.includes("wedding") || text.includes("event")) {
    return "For a wedding or event, choose a structured shirt or blazer, tapered trousers, polished loafers, and one premium accessory. Cream, black, navy, wine, and muted gold work well; avoid looking too casual unless the event is daytime or beach-themed.";
  }

  if (text.includes("black jeans")) {
    return "Black jeans pair best with a white oxford shirt for smart casual, an oversized grey hoodie for streetwear, or a black tee plus silver watch for minimal. Add clean sneakers or Chelsea boots depending on how formal you want the outfit to feel.";
  }

  if (text.includes("summer") || text.includes("winter") || text.includes("season")) {
    return "Seasonal styling: for summer, use breathable cotton/linen, lighter neutrals, and low-profile sneakers. For winter, layer with hoodies, overshirts, jackets, and deeper tones like charcoal, navy, olive, and black.";
  }

  if (text.includes("color") || text.includes("match")) {
    return `${style} works well with a black, white, grey, beige, or navy base. For ${category}, keep one hero color, repeat it once in the outfit, and use silver or matte accessories to make the palette feel deliberate.`;
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

  if (text.includes("minimal") || text.includes("streetwear") || text.includes("formal")) {
    return styleAdvice[style] || styleAdvice.Casual;
  }

  return `${categoryAdvice[category] || "Keep the outfit balanced and intentional."} ${styleAdvice[style] || styleAdvice.Casual} Check three things before saving: silhouette balance, color harmony, and whether the outfit matches the occasion.`;
}

function AIChatPanel({ open, onClose, category, style, embedded = false }) {
  const [messages, setMessages] = useState(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  const quickPrompts = useMemo(
    () => [
      "Suggest interview outfit",
      "Wedding/event look",
      "Best colors for black jeans",
      "Seasonal styling",
      `Style this ${category.toLowerCase().slice(0, -1) || "item"}`,
    ],
    [category]
  );

  const sendMessage = async (messageText = input) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    if (typing && trimmed === lastPrompt) return;

    const history = messages.slice(-6);
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    setLastPrompt(trimmed);

    try {
      const data = await fetchAssistantReply({
        message: trimmed,
        category,
        style,
        history,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data?.reply || buildReply(trimmed, category, style),
        },
      ]);
    } catch {
      window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: buildReply(trimmed, category, style),
          },
        ]);
        setTyping(false);
      }, 350);
      return;
    }

    window.setTimeout(() => {
      setTyping(false);
    }, 220);
  };

  const panelClassName = embedded
    ? "soft-ring flex min-h-[560px] w-full flex-col rounded-[28px] border border-stone-200/10 bg-[#11100e]/90"
    : `fixed inset-x-0 bottom-0 z-40 flex h-[85vh] max-h-[85vh] w-full transform flex-col overflow-hidden rounded-t-[28px] border border-stone-200/10 bg-[#11100e]/95 shadow-2xl shadow-black/40 backdrop-blur-xl transition duration-300 sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-24 sm:h-[calc(100vh-120px)] sm:max-h-[calc(100vh-120px)] sm:w-[min(420px,calc(100vw-48px))] sm:max-w-[420px] sm:rounded-[28px] ${
        open
          ? "pointer-events-auto translate-y-0 opacity-100 sm:translate-x-0"
          : "pointer-events-none translate-y-full opacity-0 sm:translate-x-full sm:translate-y-0"
      }`;

  const Wrapper = embedded ? "section" : "aside";

  return (
    <Wrapper
      className={panelClassName}
      aria-hidden={!embedded && !open}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-stone-200/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6d8c3] text-black">
            <Bot size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d6c2a1]">
              Aura Stylist
            </p>
            <h2 className="text-xl font-black">Real-time styling powered by AI</h2>
          </div>
        </div>

        {!embedded && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200/10 p-2 text-gray-300 transition hover:border-[#d6c2a1]/40 hover:text-white"
            aria-label="Close AI assistant"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm font-semibold leading-6 ${
                message.role === "user"
                  ? "bg-[#e6d8c3] text-black"
                  : "border border-stone-200/10 bg-stone-100/[0.04] text-gray-100"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="fashion-shimmer flex items-center gap-2 rounded-3xl border border-stone-200/10 bg-stone-100/[0.04] px-4 py-3 text-sm font-black text-[#e6d8c3]">
              <span>Aura is thinking</span>
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[#e6d8c3]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[#e6d8c3]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[#e6d8c3]" />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-stone-200/10 bg-[#11100e]/95 p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="button-press rounded-full border border-stone-200/10 bg-stone-100/[0.03] px-3 py-2 text-xs font-black text-gray-200 hover:border-[#d6c2a1]/40 hover:text-[#e6d8c3]"
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
            className="min-w-0 flex-1 rounded-2xl border border-stone-200/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#d6c2a1]/50"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            className="button-press rounded-2xl bg-[#e6d8c3] px-4 text-black hover:bg-white"
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

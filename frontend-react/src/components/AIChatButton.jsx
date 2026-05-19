import { MessageCircle } from "lucide-react";

function AIChatButton({ openAIChat }) {
  return (
    <button
      type="button"
      onClick={openAIChat}
      aria-label="Open AI stylist chat"
      className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-cyan-200 shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-cyan-300"
    >
      <MessageCircle size={27} />
    </button>
  );
}

export default AIChatButton;

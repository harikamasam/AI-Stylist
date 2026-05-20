import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Mic,
  MessageCircle,
  X,
  Sparkles,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

function AssistantAvatar({ compact = false }) {
  const size = compact ? "w-10 h-10" : "w-11 h-11";
  const iconSize = compact ? "w-4 h-4" : "w-5 h-5";
  const badgeSize = compact ? "w-4 h-4" : "w-[18px] h-[18px]";
  const badgeIcon = compact ? "w-2.5 h-2.5" : "w-3 h-3";

  return (
    <div className={`relative shrink-0 ${size}`}>
      <div
        className={`rounded-xl bg-gradient-to-br from-cyan-400/25 to-cyan-600/15 border border-cyan-500/35 flex items-center justify-center ${size}`}
      >
        <Sparkles className={`${iconSize} text-cyan-400`} aria-hidden />
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-secondary border border-cyan-500/40 flex items-center justify-center ${badgeSize}`}
      >
        <MessageCircle className={`${badgeIcon} text-cyan-300`} aria-hidden />
      </span>
    </div>
  );
}

export default function FloatingAssistant({
  onOpenChat,
  onStartVoice,
  listening = false,
  hidden = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("menu");

  const closePanel = () => {
    setIsOpen(false);
    setView("menu");
  };

  const openPanel = () => {
    setView("menu");
    setIsOpen(true);
  };

  const handleChat = () => {
    closePanel();
    onOpenChat?.();
  };

  const handleVoice = () => {
    setView("voice");
    onStartVoice?.();
  };

  if (hidden) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2"
      >
        <AnimatePresence>
          {!isOpen && (
            <>
              <motion.p
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: 2, duration: 0.35 }}
                className="hidden sm:block glass text-xs text-muted-foreground px-3 py-1.5 rounded-full border border-cyan-500/20 pointer-events-none"
              >
                Need styling help? Ask Aura.
              </motion.p>

              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openPanel}
                aria-label="Open Aura Stylist — I'll help you style your outfit"
                className="group relative text-left"
              >
                <span
                  className="sm:hidden absolute -top-8 right-0 glass text-[10px] text-muted-foreground px-2 py-1 rounded-lg border border-border/50 whitespace-nowrap pointer-events-none"
                  aria-hidden
                >
                  Need styling help? Ask Aura.
                </span>

                <div className="glass rounded-2xl border border-cyan-500/25 ai-glow overflow-hidden transition-colors hover:border-cyan-500/40 sm:rounded-2xl">
                  <div className="flex items-center gap-3 p-2 sm:p-3 sm:min-w-[220px] max-w-[min(100vw-2rem,280px)]">
                    <AssistantAvatar compact />
                    <div className="min-w-0 hidden sm:block">
                      <p className="text-sm font-semibold text-primary leading-tight">
                        Aura Stylist
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                        I&apos;ll help you style your outfit
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[min(calc(100vw-2rem),22rem)] sm:w-96"
            role="dialog"
            aria-labelledby="aura-assistant-title"
            aria-modal="true"
          >
            <div className="glass rounded-2xl sm:rounded-3xl overflow-hidden ai-glow border border-cyan-500/25 shadow-2xl shadow-black/40">
              <div className="p-4 border-b border-border/50 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <AssistantAvatar />
                  <div className="min-w-0">
                    <h3
                      id="aura-assistant-title"
                      className="font-semibold text-primary text-sm sm:text-base"
                    >
                      Aura Stylist
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      I&apos;ll help you style your outfit
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors shrink-0"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {view === "menu" ? (
                <div className="p-4 space-y-4">
                  <p className="text-xs text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-3 py-2 text-center">
                    Need styling help? Ask Aura.
                  </p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleChat}
                      className="w-full flex items-center gap-3 rounded-xl border border-border/80 bg-secondary/30 hover:bg-secondary/60 hover:border-cyan-500/35 p-3.5 text-left transition-colors group"
                    >
                      <span className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-cyan-400" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-primary">
                          Chat with Aura
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          Get outfit tips, colors, and product ideas
                        </span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={handleVoice}
                      className="w-full flex items-center gap-3 rounded-xl border border-border/80 bg-secondary/30 hover:bg-secondary/60 hover:border-cyan-500/35 p-3.5 text-left transition-colors group"
                    >
                      <span className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
                        <Mic className="w-5 h-5 text-cyan-400" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-primary">
                          Use Voice
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          Speak your style question hands-free
                        </span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-5">
                  <button
                    type="button"
                    onClick={() => setView("menu")}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to options
                  </button>

                  <div className="flex flex-col items-center py-4 space-y-5">
                    <button
                      type="button"
                      onClick={onStartVoice}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                        listening
                          ? "bg-cyan-500/20 border-2 border-cyan-500"
                          : "bg-secondary/50 border-2 border-border hover:border-cyan-500/50"
                      }`}
                      aria-label={listening ? "Listening" : "Start voice styling"}
                    >
                      <Mic
                        className={`w-7 h-7 ${
                          listening ? "text-cyan-400" : "text-muted-foreground"
                        }`}
                      />
                      {listening && (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.45, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border-2 border-cyan-500/50"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.7, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            className="absolute inset-0 rounded-full border border-cyan-500/30"
                          />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1 h-8">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={
                            listening
                              ? { height: [4, Math.random() * 20 + 6, 4] }
                              : { height: 4 }
                          }
                          transition={{
                            duration: 0.3,
                            repeat: listening ? Infinity : 0,
                            delay: i * 0.05,
                          }}
                          className="w-1 bg-cyan-400 rounded-full"
                        />
                      ))}
                    </div>

                    <p className="text-sm text-center text-muted-foreground">
                      {listening
                        ? "Listening... tell me what you are styling"
                        : "Tap the mic to start voice styling"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

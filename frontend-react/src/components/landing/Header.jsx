import { motion } from "framer-motion";
import { LogIn, Sparkles } from "lucide-react";

export default function Header({ onSignIn, onWatchDemo, userMenu = null }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 sm:px-6"
    >
      <nav className="mx-auto max-w-7xl">
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between sm:px-6">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
                <span className="text-lg font-bold text-primary">A</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse-glow" />
            </div>
            <div>
              <span className="text-lg font-semibold text-primary tracking-tight">
                AI Stylist
              </span>
              <span className="ml-2 text-xs text-cyan-400 font-medium">BETA</span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {[
              ["features", "Features"],
              ["demo", "Demo"],
              ["technology", "Technology"],
              ["about", "About"],
            ].map(([hash, item], i) => (
              <motion.a
                key={hash}
                href={`#${hash}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyan-400 transition-all group-hover:w-full" />
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onWatchDemo}
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Watch Demo
            </button>
            {userMenu || (
              <button
                type="button"
                onClick={onSignIn}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 py-2 sm:px-5 rounded-lg text-sm transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>
    </motion.header>
  );
}

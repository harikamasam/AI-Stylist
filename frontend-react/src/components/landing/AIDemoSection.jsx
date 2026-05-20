import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Check, 
  TrendingUp, 
  Palette, 
  Zap,
  Eye
} from "lucide-react";

const demoCards = [
  {
    id: 1,
    type: "Outfit Verdict",
    Icon: Check,
    title: "Great Match!",
    subtitle: "This piece works well with your wardrobe",
    metric: "87%",
    metricLabel: "Compatibility",
    accent: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
  },
  {
    id: 2,
    type: "Style Match",
    Icon: Sparkles,
    title: "Minimal Aesthetic",
    subtitle: "Clean lines, neutral palette detected",
    metric: "94%",
    metricLabel: "Confidence",
    accent: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
  },
  {
    id: 3,
    type: "Trending Score",
    Icon: TrendingUp,
    title: "High Fashion",
    subtitle: "Currently trending in Spring 2024",
    metric: "Top 15%",
    metricLabel: "Popularity",
    accent: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
  },
  {
    id: 4,
    type: "Color Harmony",
    Icon: Palette,
    title: "Earth Tones",
    subtitle: "Warm palette with muted undertones",
    metric: "92%",
    metricLabel: "Harmony",
    accent: "from-rose-500/20 to-rose-600/10",
    iconColor: "text-rose-400",
  },
  {
    id: 5,
    type: "AI Confidence",
    Icon: Zap,
    title: "High Certainty",
    subtitle: "Strong feature extraction quality",
    metric: "96%",
    metricLabel: "Accuracy",
    accent: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-400",
  },
];

export default function AIDemoSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % demoCards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const currentCard = demoCards[currentIndex];

  return (
    <section id="demo" className="relative py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div 
              className="relative aspect-square max-w-md mx-auto"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent rounded-full blur-2xl" />
              
              {/* Central Scanner */}
              <div className="absolute inset-8 rounded-3xl glass border-gradient overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 to-background" />
                
                {/* Scan Animation */}
                <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-cyan-500/30 overflow-hidden">
                  <motion.div
                    animate={{ 
                      y: ["0%", "100%", "0%"],
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                  />
                  
                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center"
                    >
                      <Eye className="w-10 h-10 text-cyan-400" />
                    </motion.div>
                  </div>
                </div>

                {/* Corner Dots */}
                {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-2 h-2 rounded-full bg-cyan-400 animate-pulse`} />
                ))}
              </div>

              {/* Floating Cards */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -right-4 lg:-right-16 top-1/2 -translate-y-1/2 z-10"
                >
                  <div className="glass rounded-2xl p-5 w-64 ai-glow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentCard.accent} flex items-center justify-center`}>
                        <currentCard.Icon className={`w-5 h-5 ${currentCard.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{currentCard.type}</p>
                        <p className="font-semibold text-primary">{currentCard.title}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{currentCard.subtitle}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-cyan-400">{currentCard.metric}</p>
                        <p className="text-xs text-muted-foreground">{currentCard.metricLabel}</p>
                      </div>
                      <div className="flex gap-1">
                        {demoCards.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === currentIndex ? 'bg-cyan-400 w-4' : 'bg-secondary hover:bg-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-400 font-medium">LIVE AI DEMO</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-primary leading-tight">
              Real-time
              <br />
              <span className="gradient-text">fashion intelligence</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Watch our AI analyze fashion items in real-time. Get instant verdicts on 
              style compatibility, trend analysis, color harmony, and personalized 
              recommendations—all in under 3 seconds.
            </p>

            <div className="space-y-4 pt-4">
              {[
                "Outfit compatibility scoring",
                "Style aesthetic detection",
                "Color palette analysis",
                "Trend positioning insights",
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

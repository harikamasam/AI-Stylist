import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Play,
  ArrowRight,
  Sparkles,
  Scan,
  Zap,
  Eye,
  Palette,
} from "lucide-react";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90";

const floatingTags = [
  { label: "Style Match", Icon: Sparkles, delay: 0, x: 10, y: 20 },
  { label: "AI Scan", Icon: Scan, delay: 0.2, x: 75, y: 15 },
  { label: "94% Confidence", Icon: Zap, delay: 0.4, x: 85, y: 60 },
  { label: "Minimal Aesthetic", Icon: Eye, delay: 0.6, x: 5, y: 70 },
  { label: "Earth Tones", Icon: Palette, delay: 0.8, x: 70, y: 85 },
];

export default function HeroSection({
  onStartStyling,
  onWatchDemo,
  heroImage = DEFAULT_HERO_IMAGE,
}) {
  const containerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 2500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0f0f14_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div style={{ y, opacity }} className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-400 font-medium tracking-wide">
                AI FASHION INTELLIGENCE
              </span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
              >
                <span className="text-primary">See your style</span>
                <br />
                <span className="gradient-text">before you buy.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-muted-foreground max-w-lg leading-relaxed"
              >
                Paste a fashion product and get a real-time AI styling verdict,
                virtual try-on preview, and savable outfit recommendations.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                type="button"
                onClick={onStartStyling}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-14 text-base rounded-lg group transition-colors"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Styling
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={onWatchDemo}
                className="border border-border hover:border-cyan-500/50 hover:bg-cyan-500/5 font-medium px-8 h-14 text-base rounded-lg text-primary transition-colors"
              >
                Watch Demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex gap-8 pt-4"
            >
              {[
                { value: "50K+", label: "Outfits Analyzed" },
                { value: "94%", label: "Accuracy Rate" },
                { value: "2.5s", label: "Avg. Analysis" },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - AI Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:pl-8"
          >
            <div className="relative">
              {/* Main Preview Card */}
              <div className="relative rounded-3xl overflow-hidden glass border-gradient ai-glow">
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-cyan-900/20 to-secondary/50 overflow-hidden">
                  {/* Fashion Image Placeholder with gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                  
                  {/* Hero preview */}
                  <img
                    src={heroImage}
                    alt="AI Stylist fashion-tech preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 hidden flex items-center justify-center">
                    <div className="w-48 h-64 rounded-2xl bg-gradient-to-br from-amber-100/20 to-rose-100/10 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200/30 to-amber-300/20 mx-auto" />
                        <div className="w-24 h-32 rounded-lg bg-gradient-to-br from-red-400/20 to-red-500/10 mx-auto" />
                      </div>
                    </div>
                  </div>

                  {/* AI Scan Overlay */}
                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-20"
                    >
                      {/* Scan Line */}
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline" />
                      
                      {/* Grid Overlay */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
                          `,
                          backgroundSize: '40px 40px'
                        }}
                      />

                      {/* Corner Markers */}
                      {[
                        "top-4 left-4", "top-4 right-4",
                        "bottom-4 left-4", "bottom-4 right-4"
                      ].map((pos, i) => (
                        <div key={i} className={`absolute ${pos} w-8 h-8 border-2 border-cyan-400/50 ${i < 2 ? 'border-b-0 border-r-0' : i === 2 ? 'border-t-0 border-r-0' : 'border-t-0 border-l-0'}`}>
                          <div className={`absolute ${i < 2 ? 'top-0' : 'bottom-0'} ${i % 2 === 0 ? 'left-0' : 'right-0'} w-2 h-2 bg-cyan-400 rounded-full animate-pulse`} />
                        </div>
                      ))}

                      {/* Analyzing Text */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-cyan-400 font-mono text-sm tracking-wider animate-pulse">
                          ANALYZING FIT...
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Tab Navigation */}
                  <div className="absolute top-4 left-4 right-4 z-30 flex gap-2 flex-wrap">
                    {["Live Try-On", "Pose Tracking", "Outfit Verdict", "AI Wardrobe"].map((tab, i) => (
                      <motion.button
                        key={tab}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          i === 0 
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                            : 'bg-secondary/50 text-muted-foreground hover:text-primary'
                        }`}
                      >
                        {tab}
                      </motion.button>
                    ))}
                  </div>

                  {/* Floating Tags */}
                  {floatingTags.map((tag) => (
                    <motion.div
                      key={tag.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + tag.delay }}
                      style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                      className="absolute z-30 animate-float"
                    >
                      <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-primary whitespace-nowrap">
                        <tag.Icon className="w-3 h-3 text-cyan-400" />
                        {tag.label}
                      </div>
                    </motion.div>
                  ))}

                  {/* Confidence Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="absolute right-4 top-1/3 z-30"
                  >
                    <div className="glass rounded-2xl p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">AI CONFIDENCE</p>
                      <p className="text-3xl font-bold text-cyan-400 text-glow">94%</p>
                    </div>
                  </motion.div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-cyan-400 font-medium">AI DETECTED AESTHETIC</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">MINIMAL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "94%" }}
                            transition={{ delay: 1, duration: 1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">94%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

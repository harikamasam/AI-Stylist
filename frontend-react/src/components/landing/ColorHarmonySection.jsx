import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Scan, Sparkles } from "lucide-react";

const colorWheel = [
  { color: "bg-amber-200", label: "Cream", rotation: 0 },
  { color: "bg-amber-400", label: "Gold", rotation: 45 },
  { color: "bg-rose-400", label: "Rose", rotation: 90 },
  { color: "bg-rose-600", label: "Berry", rotation: 135 },
  { color: "bg-slate-600", label: "Charcoal", rotation: 180 },
  { color: "bg-slate-800", label: "Onyx", rotation: 225 },
  { color: "bg-cyan-400", label: "Cyan", rotation: 270 },
  { color: "bg-teal-500", label: "Teal", rotation: 315 },
];

export default function ColorHarmonySection() {
  const containerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [activeColor, setActiveColor] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotation = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <section
      ref={containerRef}
      id="technology"
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 glass-light px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">COLOR HARMONY AI</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-primary leading-tight">
              Discover your
              <br />
              <span className="gradient-text">perfect palette</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Our AI analyzes color relationships, undertones, and seasonal palettes 
              to recommend colors that complement your wardrobe and skin tone.
            </p>

            {/* Active Color Display */}
            <div className="glass rounded-2xl p-6 max-w-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorWheel[activeColor].color}`} />
                <div>
                  <p className="font-semibold text-primary">{colorWheel[activeColor].label}</p>
                  <p className="text-sm text-muted-foreground">Selected Color</p>
                </div>
              </div>
              <div className="flex gap-2">
                {colorWheel.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg ${c.color} cursor-pointer hover:scale-110 transition-transform`}
                    onClick={() => setActiveColor(i)}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Interactive Color Wheel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div
              className="relative aspect-square max-w-md mx-auto"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Outer Ring */}
              <motion.div
                style={{ rotate: rotation }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20"
              />

              {/* Color Wheel */}
              <div className="absolute inset-8">
                <motion.div
                  animate={{ rotate: isHovering ? 45 : 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  {colorWheel.map((color, i) => {
                    const angle = (i / colorWheel.length) * 360;
                    const x = Math.cos((angle - 90) * (Math.PI / 180)) * 42;
                    const y = Math.sin((angle - 90) * (Math.PI / 180)) * 42;

                    return (
                      <motion.button
                        key={i}
                        onClick={() => setActiveColor(i)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`absolute w-12 h-12 rounded-xl ${color.color} shadow-lg transition-all ${
                          activeColor === i ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-background' : ''
                        }`}
                        style={{
                          left: `calc(50% + ${x}% - 24px)`,
                          top: `calc(50% + ${y}% - 24px)`,
                        }}
                      />
                    );
                  })}

                  {/* Center Scanner */}
                  <div className="absolute inset-1/4 rounded-full glass flex items-center justify-center ai-glow">
                    <div className="text-center">
                      <Scan className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Hover to scan</p>
                    </div>
                    
                    {/* Scanning Animation */}
                    {isHovering && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-2 rounded-full border-t-2 border-cyan-400"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Floating Labels */}
              {isHovering && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                >
                  <div className="glass px-4 py-2 rounded-full">
                    <p className="text-sm text-cyan-400">
                      Analyzing harmony...
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

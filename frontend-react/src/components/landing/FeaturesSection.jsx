import { motion } from "framer-motion";
import {
  Sparkles,
  Eye,
  Palette,
  Zap,
  Camera,
  Save,
} from "lucide-react";

const features = [
  {
    Icon: Eye,
    title: "AI Mirror",
    description: "Real-time virtual try-on powered by advanced pose estimation",
    tag: "Live",
  },
  {
    Icon: Sparkles,
    title: "Outfit Verdicts",
    description: "Get instant AI-powered styling feedback and recommendations",
    tag: "AI",
  },
  {
    Icon: Save,
    title: "Saved Wardrobe",
    description: "Build and organize your personal AI-curated collection",
    tag: "Storage",
  },
  {
    Icon: Camera,
    title: "Pose Tracking",
    description: "MediaPipe-powered body landmark detection for accurate fits",
    tag: "Tech",
  },
  {
    Icon: Palette,
    title: "Color Analysis",
    description: "Discover your ideal color palette with AI color harmony",
    tag: "Style",
  },
  {
    Icon: Zap,
    title: "Instant Analysis",
    description: "Process fashion items in under 2.5 seconds on average",
    tag: "Fast",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-4 px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 text-xs font-medium">
            DEPLOYED FULL-STACK AI PLATFORM
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            Everything you need for
            <br />
            <span className="gradient-text">AI-powered styling</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete fashion intelligence platform with real-time analysis,
            virtual try-on, and personalized recommendations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="recruiter-hover h-full glass rounded-2xl p-6 border-gradient hover:ai-glow transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <feature.Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary/80 text-muted-foreground">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

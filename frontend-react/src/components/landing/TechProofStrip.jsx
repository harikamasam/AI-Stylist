import { motion } from "framer-motion";
import { 
  Code2, 
  Server, 
  Cpu, 
  Database, 
  Sparkles, 
  CloudUpload, 
  Globe 
} from "lucide-react";

const techStack = [
  { name: "React", Icon: Code2 },
  { name: "FastAPI", Icon: Server },
  { name: "MediaPipe", Icon: Cpu },
  { name: "Firebase", Icon: Database },
  { name: "AI Outfit Engine", Icon: Sparkles },
  { name: "Vercel", Icon: CloudUpload },
  { name: "Render", Icon: Globe },
];

export default function TechProofStrip() {
  return (
    <section className="relative py-8 border-y border-border/50 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest shrink-0">
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                className="recruiter-hover flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 hover:border-cyan-500/30 transition-colors"
              >
                <tech.Icon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-primary">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

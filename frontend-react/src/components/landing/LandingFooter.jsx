import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Twitter, Sparkles } from "lucide-react";

export default function LandingFooter({ onGetStarted, onViewDemo }) {
  return (
    <footer id="about" className="relative pt-24 pb-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="glass rounded-3xl p-12 max-w-3xl mx-auto border-gradient">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Ready to transform your style?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of fashion-forward users discovering their perfect 
              style with AI-powered recommendations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onGetStarted}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-14 text-base rounded-lg group transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={onViewDemo}
                className="border border-border hover:border-cyan-500/50 font-medium px-8 h-14 text-base rounded-lg text-primary transition-colors"
              >
                View Demo
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
                <span className="text-lg font-bold text-primary">A</span>
              </div>
              <span className="text-lg font-semibold text-primary">AI Stylist</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your personal AI fashion intelligence platform. 
              See your style before you buy.
            </p>
            <div className="flex gap-3">
              {[
                [Github, "https://github.com", "GitHub"],
                [Twitter, "https://x.com", "X"],
                [Linkedin, "https://www.linkedin.com", "LinkedIn"],
              ].map(([Icon, href, label]) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Product",
              links: [
                ["Features", "#features"],
                ["Demo", "#demo"],
                ["Pricing", "#about"],
                ["API", "#technology"],
              ],
            },
            {
              title: "Technology",
              links: [
                ["MediaPipe", "#technology"],
                ["AI Engine", "#demo"],
                ["FastAPI", "#technology"],
                ["Firebase", "#technology"],
              ],
            },
            {
              title: "Resources",
              links: [
                ["Documentation", "#about"],
                ["Blog", "#features"],
                ["Support", "#about"],
                ["Contact", "#about"],
              ],
            },
          ].map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-semibold text-primary">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(([link, href]) => (
                  <li key={link}>
                    <a
                      href={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Stylist. Built with React, FastAPI &amp; AI.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

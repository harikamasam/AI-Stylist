import { Sparkles, Watch, Palette, CalendarDays } from "lucide-react";
import { useOutfitAnalysis } from "../hooks/useOutfitAnalysis";

const COLOR_SWATCHES = {
  black: "#050505",
  white: "#f8fafc",
  grey: "#71717a",
  gray: "#71717a",
  beige: "#d6c2a1",
  navy: "#172554",
  cream: "#f3ead7",
  charcoal: "#27272a",
  gold: "#d4af37",
  maroon: "#7f1d1d",
  silver: "#cbd5e1",
  olive: "#556b2f",
  "light blue": "#93c5fd",
  "deep green": "#14532d",
};

function ScoreBar({ label, value, tone = "from-cyan-400 to-emerald-300" }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm font-bold">
        <span className="text-gray-300">{label}</span>
        <span className="text-white">{value}%</span>
      </div>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/60 border border-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(Number(value) || 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

function OutfitInsights({ category, style, pose }) {
  const { analysis, loading, error } = useOutfitAnalysis(category, style, pose);
  const compatibility =
    analysis.compatibility_score || analysis.fashion_compatibility_score;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-zinc-950/90 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur sm:p-5 lg:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
            Outfit Intelligence
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black">
            AI Style Verdict
          </h2>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3">
          <p className="text-gray-400 text-xs font-bold uppercase">
            Compatibility
          </p>
          <p className="text-cyan-300 text-3xl font-black">
            {loading ? "--" : `${compatibility}%`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm font-bold text-rose-200">
          {error}
        </div>
      )}

      <p className="mt-4 text-sm leading-6 text-gray-300 sm:text-base">
        {loading
          ? "Evaluating silhouette, palette, and occasion fit..."
          : analysis.recommendation_reason}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 transition duration-300 hover:border-cyan-300/40">
          <div className="flex items-center gap-2 text-cyan-300 font-black">
            <Sparkles size={18} />
            Outfit Combination
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.outfit_suggestions.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold text-gray-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 transition duration-300 hover:border-cyan-300/40">
          <div className="flex items-center gap-2 text-cyan-300 font-black">
            <Watch size={18} />
            Accessories
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.suggested_accessories.map((item) => (
              <span
                key={item}
                className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-3 py-2 text-sm font-bold text-cyan-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
        <div className="flex items-center gap-2 text-cyan-300 font-black">
          <Palette size={18} />
          Color Palette
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {analysis.best_colors.map((color) => (
            <div
              key={color}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-sm font-bold capitalize"
            >
              <span
                className="h-4 w-4 rounded-full border border-white/30"
                style={{ backgroundColor: COLOR_SWATCHES[color] || color }}
              />
              {color}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ScoreBar label="Confidence" value={loading ? 18 : analysis.confidence} />
        <ScoreBar
          label="Professional"
          value={loading ? 18 : analysis.professional_score}
          tone="from-sky-400 to-cyan-300"
        />
        <ScoreBar
          label="Casual"
          value={loading ? 18 : analysis.casual_score}
          tone="from-pink-400 to-cyan-300"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 font-black text-cyan-300">
        <CalendarDays size={18} />
        Occasions
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {analysis.occasion_recommendations.map((occasion) => (
          <span
            key={occasion}
            className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-100"
          >
            {occasion}
          </span>
        ))}
      </div>
    </section>
  );
}

export default OutfitInsights;

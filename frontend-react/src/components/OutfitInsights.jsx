import { CalendarDays, CheckCircle2, Palette, Sparkles, Watch } from "lucide-react";
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

function ScoreBar({ label, value, tone = "from-[#d6c2a1] to-stone-100" }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm font-bold">
        <span className="text-stone-300">{label}</span>
        <span className="text-white">{value}%</span>
      </div>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-stone-200/10 bg-black/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(Number(value) || 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

function OutfitInsights({ category, style, pose }) {
  const { analysis, loading } = useOutfitAnalysis(category, style, pose);
  const compatibility =
    analysis.compatibility_score || analysis.fashion_compatibility_score;

  return (
    <section className="soft-ring relative overflow-hidden rounded-[28px] border border-stone-200/10 bg-[#11100e]/90 p-4 backdrop-blur sm:p-5 lg:p-6">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d6c2a1]/60 to-transparent" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d6c2a1]">
            Outfit Intelligence
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black">
            AI Style Verdict
          </h2>
        </div>

        <div className="rounded-2xl border border-[#d6c2a1]/20 bg-[#d6c2a1]/10 px-4 py-3">
          <p className="text-stone-400 text-xs font-bold uppercase">
            Compatibility
          </p>
          <p className="text-[#e6d8c3] text-3xl font-black">
            {loading ? "--" : `${compatibility}%`}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-stone-200/10 bg-stone-100/[0.035] p-4">
        <div className="flex items-center gap-2 text-[#e6d8c3] font-black">
          <CheckCircle2 size={18} />
          Outfit Verdict
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-300 sm:text-base">
        {loading
          ? "Evaluating silhouette, palette, and occasion fit..."
          : analysis.recommendation_reason}
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200/10 bg-black/25 p-4 transition duration-300 hover:border-[#d6c2a1]/35">
          <div className="flex items-center gap-2 text-[#e6d8c3] font-black">
            <Sparkles size={18} />
            Outfit Combination
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.outfit_suggestions.map((item) => (
              <span
                key={item}
                className="rounded-full border border-stone-200/10 bg-black/40 px-3 py-2 text-sm font-bold text-stone-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200/10 bg-black/25 p-4 transition duration-300 hover:border-[#d6c2a1]/35">
          <div className="flex items-center gap-2 text-[#e6d8c3] font-black">
            <Watch size={18} />
            Accessories
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.suggested_accessories.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#d6c2a1]/15 bg-[#d6c2a1]/10 px-3 py-2 text-sm font-bold text-stone-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-stone-200/10 bg-black/25 p-4">
        <div className="flex items-center gap-2 text-[#e6d8c3] font-black">
          <Palette size={18} />
          Color Palette
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {analysis.best_colors.map((color) => (
            <div
              key={color}
              className="flex items-center gap-2 rounded-full border border-stone-200/10 bg-black/40 px-3 py-2 text-sm font-bold capitalize"
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
          tone="from-slate-200 to-[#d6c2a1]"
        />
        <ScoreBar
          label="Casual"
          value={loading ? 18 : analysis.casual_score}
          tone="from-[#d6c2a1] to-emerald-200"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 font-black text-[#e6d8c3]">
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

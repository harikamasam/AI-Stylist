import { ANALYTICS_METRICS, useAnalytics } from "../hooks/useAnalytics";

function AIAnalytics({
  category,
  style,
  colors = [],
  pose = "unknown",
  tryOnMetrics = {},
}) {
  const { analytics, averageScore, reasonCards, explainableAnalysis, loading } = useAnalytics(
    category,
    style,
    colors,
    pose,
    tryOnMetrics
  );

  return (
    <section className="soft-ring overflow-hidden rounded-[28px] border border-stone-200/10 bg-[#11100e]/90 p-4 backdrop-blur sm:p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d6c2a1]">
            Live AI Analytics
          </p>

          <h2 className="text-2xl font-black mt-2">Style Intelligence</h2>
        </div>

        <div className="rounded-2xl border border-[#d6c2a1]/20 bg-[#d6c2a1]/10 px-4 py-3 text-left sm:text-right">
          <p className="text-stone-400 text-xs font-bold uppercase">Overall</p>

          <p className="text-[#e6d8c3] text-3xl font-black">
            {loading ? "--" : `${averageScore}%`}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
              Explainable AI Styling Panel
            </p>
            <h3 className="mt-1 text-lg font-black text-stone-50">
              Color, occasion, body balance, and style logic
            </h3>
          </div>
          <span className="rounded-full border border-[#d6c2a1]/25 bg-[#d6c2a1]/10 px-3 py-2 text-xs font-black text-[#e6d8c3]">
            {loading ? "Evaluating" : "Reasoned verdicts"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {[
            ["Color Harmony Analysis", explainableAnalysis.color_harmony],
            ["Body Balance Analysis", explainableAnalysis.body_balance],
            ["Style Consistency Analysis", explainableAnalysis.style_consistency],
          ].map(([title, item]) => (
            <div
              key={title}
              className="rounded-2xl border border-stone-200/10 bg-black/28 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d6c2a1]">
                  {title}
                </p>
                <span className="rounded-full border border-stone-200/10 bg-stone-100/[0.04] px-2 py-1 text-xs font-black text-stone-100">
                  {loading ? "--" : `${item.verdict} ${item.score}%`}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-300">
                {loading ? "Building deterministic fashion reasoning..." : item.reason}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {explainableAnalysis.occasion_analysis.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-stone-200/10 bg-stone-100/[0.03] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-200">
                  {item.label}
                </p>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs font-black text-emerald-100">
                  {loading ? "--" : `${item.verdict} ${item.score}%`}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-400">
                {loading ? "Checking occasion suitability..." : item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {reasonCards.map((insight) => (
          <div
            key={insight.title}
            className="rounded-2xl border border-stone-200/10 bg-stone-100/[0.035] p-3 sm:p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6c2a1]">
                {insight.title}
              </p>
              <span className="rounded-full border border-stone-200/10 bg-black/35 px-2 py-1 text-xs font-black text-stone-200">
                {loading ? "--" : `${insight.score}%`}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-300">
              {insight.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ANALYTICS_METRICS.map((metric) => {
          const value = Number(analytics[metric.key] || 0);

          return (
            <div
              key={metric.key}
              className="rounded-2xl border border-stone-200/10 bg-black/25 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[#d6c2a1]/35 sm:p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-gray-200">
                  {metric.label}
                </span>

                <span className="text-sm font-black text-[#e6d8c3]">
                  {loading ? "--" : `${value}%`}
                </span>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/50">
                <div
                  className={`h-full bg-gradient-to-r ${metric.tone} rounded-full transition-all duration-700 ease-out`}
                  style={{
                    width: loading ? "18%" : `${Math.min(value, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
        <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 px-3 py-2 rounded-full">
          {category}
        </span>

        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 px-3 py-2 rounded-full">
          {style}
        </span>
        {colors.slice(0, 3).map((color) => (
          <span
            key={color}
            className="rounded-full border border-stone-200/10 bg-stone-100/[0.035] px-3 py-2 text-stone-300"
          >
            {color}
          </span>
        ))}
        {tryOnMetrics.landmarksDetected && (
          <>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-cyan-100">
              Fit confidence {tryOnMetrics.confidence}%
            </span>
            <span className="rounded-full border border-stone-200/10 bg-stone-100/[0.035] px-3 py-2 text-stone-300">
              Shoulder {tryOnMetrics.shoulder}
            </span>
            <span className="rounded-full border border-stone-200/10 bg-stone-100/[0.035] px-3 py-2 text-stone-300">
              Alignment {tryOnMetrics.alignment}
            </span>
          </>
        )}
      </div>
    </section>
  );
}

export default AIAnalytics;

import { ANALYTICS_METRICS, useAnalytics } from "../hooks/useAnalytics";

function AIAnalytics({ category, style }) {
  const { analytics, averageScore, loading } = useAnalytics(
    category,
    style
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

      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>
    </section>
  );
}

export default AIAnalytics;

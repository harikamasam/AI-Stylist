import { BookmarkPlus, Heart } from "lucide-react";

function RecommendationSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-stone-200/10 bg-[#11100e]">
      <div className="fashion-shimmer h-[170px]" />
      <div className="space-y-4 p-4">
        <div className="h-6 rounded-xl bg-white/10" />
        <div className="h-4 w-2/3 rounded-xl bg-white/10" />
        <div className="flex justify-between gap-3">
          <div className="h-9 w-28 rounded-full bg-white/10" />
          <div className="h-9 w-24 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function RecommendationPanel({
  products,
  style,
  loading,
  error,
  onSaveOutfit,
  onFavoriteRecommendation,
  compact = false,
}) {
  return (
    <section className="rounded-[28px] border border-stone-200/10 bg-[#11100e]/90 p-4 shadow-2xl shadow-black/25 backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d6c2a1]">
            Recommendation Engine
          </p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">
            AI Recommendations
          </h2>
        </div>

        {error && (
          <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300">
            Offline fallback
          </span>
        )}
      </div>

      <div
        className={
          compact
            ? "flex gap-3 overflow-x-auto pb-2"
            : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {loading
          ? [0, 1, 2].map((item) => <RecommendationSkeleton key={item} />)
          : products.map((item) => (
              <div
                key={`${item.title}-${item.match}`}
                className={`overflow-hidden rounded-2xl border border-stone-200/10 bg-[#161412]/90 transition duration-300 hover:-translate-y-1 hover:border-stone-100/25 hover:shadow-xl hover:shadow-black/30 ${
                  compact ? "w-[220px] shrink-0" : ""
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-[120px] w-full object-cover"
                />

                <div className="p-3">
                  <h2 className="line-clamp-2 min-h-[44px] text-base font-black">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-gray-400">
                    {item.brand} / {style}
                  </p>

                  <p className="mt-2 text-lg font-black text-white">
                    {item.price}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-between gap-2">
                    <div className="rounded-full bg-[#d6c2a1]/10 px-3 py-1.5 text-xs font-bold text-[#e6d8c3]">
                      Match: {item.match}
                    </div>

                    <div className="rounded-full bg-stone-100/10 px-3 py-1.5 text-xs font-bold text-stone-100">
                      {item.tag}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSaveOutfit?.(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#d6c2a1]/20 bg-[#d6c2a1]/10 px-2 py-2 text-xs font-black text-[#e6d8c3] transition hover:bg-[#e6d8c3] hover:text-black"
                    >
                      <BookmarkPlus size={16} />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => onFavoriteRecommendation?.(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-stone-200/10 bg-stone-100/[0.035] px-2 py-2 text-xs font-black text-stone-200 transition hover:border-stone-100/30"
                    >
                      <Heart size={16} />
                      Favorite
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}

export default RecommendationPanel;

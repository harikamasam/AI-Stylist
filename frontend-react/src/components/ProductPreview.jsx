import { Link2, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useProductExtraction } from "../hooks/useProductExtraction";

const PLACEHOLDERS = [
  "Paste Myntra fashion link...",
  "Paste Ajio product URL...",
  "Paste Amazon fashion link...",
];

const TRY_ON_STEPS = {
  idle: "Ready to generate",
  extracting: "Extracting product...",
  analyzing: "Analyzing clothing...",
  generating: "Generating try-on preview...",
  complete: "AI try-on preview ready",
};

const DEMO_LINKS = [
  {
    label: "Casual Shirt",
    category: "Shirts",
    url: "https://www.myntra.com/shirts/demo-casual-shirt",
  },
  {
    label: "Hoodie",
    category: "Hoodies",
    url: "https://www.ajio.com/hoodies/demo-premium-hoodie",
  },
  {
    label: "Sneakers",
    category: "Shoes",
    url: "https://www.amazon.in/fashion-sneakers-demo",
  },
  {
    label: "Watch",
    category: "Watches",
    url: "https://www.myntra.com/watches/demo-minimal-watch",
  },
];

function ProductPreview({
  category,
  productUrl,
  setProductUrl,
  onSelectCategory,
  onSave,
  onStartTryOn,
  tryOnState = "idle",
}) {
  const { product, loading, error } = useProductExtraction(productUrl, category);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const isAnalyzing =
    tryOnState === "extracting" ||
    tryOnState === "analyzing" ||
    tryOnState === "generating";
  const isComplete = tryOnState === "complete";
  const statusText = loading
    ? "Extracting product..."
    : TRY_ON_STEPS[tryOnState] || TRY_ON_STEPS.idle;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % PLACEHOLDERS.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  const handleDemoLink = (demo) => {
    onSelectCategory?.(demo.category);
    setProductUrl(demo.url);
  };

  return (
    <section className="soft-ring relative overflow-hidden rounded-[32px] border border-[#d6c2a1]/18 bg-[#11100e]/92 p-4 backdrop-blur sm:p-5">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#e6d8c3]/70 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-28 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mb-4 flex flex-col items-center gap-3">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d6c2a1]">
            Section 1 / AI Try-On
          </p>
          <h2 className="max-w-3xl text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">
            Paste product link
          </h2>
          <p className="max-w-2xl text-sm font-semibold leading-6 text-stone-400">
            Paste product URL -> Generate AI Try-On -> See outfit on body.
          </p>
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100">
            {statusText}
          </div>
        </div>

        <div className="tryon-input-glow rounded-[28px] border border-[#d6c2a1]/25 bg-black/48 p-3 text-left shadow-2xl shadow-black/35 transition focus-within:border-[#e6d8c3]/70 focus-within:shadow-[#d6c2a1]/10 sm:p-4">
            <label
              htmlFor="product-url"
              className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#e6d8c3]"
            >
              <Search size={16} />
              Fashion Product Link
            </label>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative min-w-0 flex-1">
                <Link2
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d6c2a1]"
                  size={20}
                />
                <input
                  id="product-url"
                  type="text"
                  placeholder={PLACEHOLDERS[placeholderIndex]}
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-stone-200/10 bg-stone-950/80 pl-12 pr-4 text-base font-semibold text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-[#e6d8c3]/70 focus:ring-4 focus:ring-[#d6c2a1]/10 sm:h-16 sm:text-lg"
                />
              </div>
              <button
                type="button"
                onClick={onStartTryOn}
                disabled={isAnalyzing}
                className="button-press inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#e6d8c3] px-6 text-sm font-black text-black shadow-lg shadow-[#d6c2a1]/10 hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 sm:h-16 sm:text-base"
              >
                <Sparkles size={19} />
                {isAnalyzing
                  ? statusText
                  : isComplete
                    ? "Generate Again"
                    : "Generate AI Try-On"}
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-stone-400">
              AI extracts clothing and previews it on your body instantly.
            </p>
          </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">
              Try Demo Links:
            </span>
            {DEMO_LINKS.map((demo) => (
              <button
                key={demo.label}
                type="button"
                onClick={() => handleDemoLink(demo)}
                className="button-press rounded-full border border-stone-200/10 bg-stone-100/[0.045] px-3 py-2 text-xs font-black text-stone-200 hover:-translate-y-0.5 hover:border-[#d6c2a1]/45 hover:text-[#e6d8c3]"
              >
                {demo.label}
              </button>
            ))}
          </div>

        <div className="mt-5 grid overflow-hidden rounded-[26px] border border-stone-200/10 bg-black/30 text-left shadow-xl shadow-black/20 md:grid-cols-[200px_minmax(0,1fr)] lg:mx-auto lg:max-w-3xl">
          <div className="relative overflow-hidden bg-zinc-900">
            <img
              src={product.image}
              alt={product.title}
              className="h-[160px] w-full object-cover transition duration-500 hover:scale-[1.02] md:h-full md:min-h-[180px]"
            />

            {loading && (
              <div className="fashion-shimmer absolute inset-0 backdrop-blur-[1px]" />
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/72 text-center backdrop-blur-sm">
                <div className="fashion-shimmer h-12 w-12 rounded-full border border-stone-200/10" />
                <p className="mt-3 px-3 text-xs font-black uppercase tracking-[0.18em] text-[#e6d8c3]">
                  {statusText}
                </p>
              </div>
            )}

            {isComplete && (
              <div className="absolute right-3 top-3 rounded-full border border-[#d6c2a1]/30 bg-black/70 px-3 py-2 text-xs font-black text-[#e6d8c3] backdrop-blur">
                AI Try-On
              </div>
            )}
          </div>

          <div className="p-4">
            <h2 className="line-clamp-1 text-lg font-black">{product.title}</h2>

            <p className="mt-1 text-2xl font-black text-[#e6d8c3]">
              {loading ? "Checking..." : product.price}
            </p>

            {error && (
              <p className="mt-2 rounded-xl border border-stone-200/10 bg-stone-100/[0.035] px-3 py-2 text-xs font-bold text-stone-300">
                {error}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-400">
              <span>
                Brand:
                <span className="ml-2 font-bold text-white">{product.brand}</span>
              </span>
              <span>
                Category:
                <span className="ml-2 font-bold text-white">
                  {product.category || category}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={onSave}
              className="button-press mt-3 w-full rounded-2xl border border-stone-200/10 bg-stone-100/[0.08] px-3 py-2.5 text-sm font-black text-stone-100 hover:-translate-y-0.5 hover:border-stone-100/30"
            >
              Save Look
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductPreview;

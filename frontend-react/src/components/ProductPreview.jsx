import { CheckCircle2, ChevronDown, Link2, ScanLine, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useProductExtraction } from "../hooks/useProductExtraction";

const PLACEHOLDERS = [
  "Paste Myntra fashion link...",
  "Paste Ajio product URL...",
  "Paste Amazon fashion link...",
];

const TRY_ON_STEPS = {
  idle: "Ready to generate",
  extracting: "Extracting garment from product link",
  analyzing: "Detecting body landmarks",
  generating: "Aligning shirt to torso",
  rendering: "Rendering AI try-on preview",
  complete: "AI try-on preview ready",
};

const TRY_ON_SEQUENCE = [
  ["extracting", "Extract garment", 0],
  ["analyzing", "Detect landmarks", 1],
  ["generating", "Build body mask", 2],
  ["generating", "Fit garment", 3],
  ["rendering", "Render try-on", 4],
];

const RECRUITER_WORKFLOW = [
  ["Product Extraction", "Detects Myntra, Ajio, Amazon, or generic fashion links and returns a product image, source, category, and dominant color signal."],
  ["Garment Processing", "Uses category-aware crop, mask, and overlay metadata so shirts, shoes, watches, and glasses follow different preview logic."],
  ["Landmark Detection", "Runs MediaPipe pose and face models to track shoulders, hips, wrists, feet, and face regions in the live mirror."],
  ["Body Mapping", "Builds a shoulder-to-waist torso polygon and estimates shoulder width, chest width, torso height, and body scale."],
  ["Overlay Alignment", "Applies scale, rotation correction, perspective skew, opacity blending, soft shadows, and frame-to-frame smoothing."],
  ["Style Intelligence Engine", "Combines color harmony, occasion fit, body balance, and style consistency into deterministic explanations with Gemini fallback support."],
  ["Recommendation Generation", "Uses category, style, product, colors, analytics, and saved wardrobe context to drive recommendations and Aura responses."],
];

const CATEGORY_PREVIEW_MODE = {
  Shirts: {
    badge: "Torso alignment active",
    title: "AI Shirt Try-On Simulation",
    subtitle: "Upper body fit preview with shoulder and torso alignment.",
  },
  Hoodies: {
    badge: "Layer volume preview",
    title: "AI Hoodie Fit Simulation",
    subtitle: "Torso mapping estimates shoulder width and garment volume.",
  },
  Shoes: {
    badge: "Lower-body focus",
    title: "Footwear Preview Mode",
    subtitle: "Stance and lower-body focus for shoe styling context.",
  },
  Glasses: {
    badge: "Face focus",
    title: "Eyewear Preview Mode",
    subtitle: "Face framing mode for glasses and sunglasses alignment.",
  },
  Watches: {
    badge: "Wrist focus",
    title: "Accessory Preview Mode",
    subtitle: "Wrist and arm focus for watch scale and metal-tone styling.",
  },
};

const FOCUS_COPY = {
  Shirts: "Shoulder width, chest fall, and hem position are estimated from torso landmarks.",
  Hoodies: "Layer volume is fitted around the shoulder line with a softer oversized boundary.",
  Shoes: "Preview mode shifts attention to stance, lower-body balance, and shoe weight.",
  Glasses: "Preview mode prioritizes face framing, frame width, and color balance.",
  Watches: "Preview mode focuses on wrist scale, sleeve gap, and accessory metal tone.",
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
  onProductChange,
}) {
  const { product, loading, error } = useProductExtraction(productUrl, category);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [recruiterOpen, setRecruiterOpen] = useState(false);
  const previewMode = CATEGORY_PREVIEW_MODE[category] || CATEGORY_PREVIEW_MODE.Shirts;
  const isAnalyzing =
    tryOnState === "extracting" ||
    tryOnState === "analyzing" ||
    tryOnState === "generating" ||
    tryOnState === "rendering";
  const isComplete = tryOnState === "complete";
  const pipeline = product.garment_pipeline || {};
  const dominantColors = product.dominant_colors || [];
  const statusText = loading
    ? "Extracting product..."
    : TRY_ON_STEPS[tryOnState] || TRY_ON_STEPS.idle;
  const activePipelineIndex = {
    idle: -1,
    extracting: 0,
    analyzing: 1,
    generating: 3,
    rendering: 4,
    complete: 4,
  }[tryOnState] ?? -1;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % PLACEHOLDERS.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    onProductChange?.(product);
  }, [onProductChange, product]);

  const handleDemoLink = (demo) => {
    onSelectCategory?.(demo.category);
    setProductUrl(demo.url);
  };

  return (
    <section className="soft-ring relative overflow-hidden rounded-[32px] border border-[#d6c2a1]/18 bg-[#11100e]/92 p-4 backdrop-blur sm:p-5">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#e6d8c3]/70 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-28 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d6c2a1]">
            Section 1 / AI Try-On
          </p>
          <h2 className="max-w-3xl text-2xl font-black tracking-tight text-stone-50 sm:text-3xl">
            Paste product link
          </h2>
          <p className="max-w-2xl text-sm font-semibold leading-6 text-stone-400">
            Paste a product link, extract the garment signal, align it to body landmarks, then refine the look with Aura.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100">
              {statusText}
            </div>
            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100">
              {previewMode.badge}
            </div>
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
            <div className="mt-3 grid gap-2 text-xs font-black text-stone-300 sm:grid-cols-4">
              {TRY_ON_SEQUENCE.map(([key, label, index]) => {
                const active = activePipelineIndex >= index;

                return (
                  <div
                    key={`${key}-${label}`}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                      active
                        ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                        : "border-stone-200/10 bg-stone-100/[0.025] text-stone-500"
                    }`}
                  >
                    {active ? <CheckCircle2 size={14} /> : <ScanLine size={14} />}
                    {label}
                  </div>
                );
              })}
            </div>
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

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] lg:items-stretch">
          <div className="overflow-hidden rounded-[26px] border border-stone-200/10 bg-black/30 text-left shadow-xl shadow-black/20">
            <div className="relative aspect-[16/11] overflow-hidden bg-zinc-900">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
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
                Rendered Preview
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
                {product.source && (
                  <span>
                    Source:
                    <span className="ml-2 font-bold text-white">
                      {product.source}
                    </span>
                  </span>
                )}
              </div>

              <div className="mt-3 grid gap-2 text-xs font-black text-stone-300 sm:grid-cols-2">
                {[
                  ["Image extracted", pipeline.image_extracted],
                  ["Overlay optimized", pipeline.overlay_ready],
                  ["Background mask", pipeline.background_removed],
                  [`Confidence ${pipeline.confidence || 84}%`, true],
                ].map(([label, active]) => (
                  <span
                    key={label}
                    className={`rounded-xl border px-3 py-2 ${
                      active
                        ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                        : "border-stone-200/10 bg-stone-100/[0.035] text-stone-400"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-stone-200/10 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6c2a1]">
                    Extraction Engine
                  </p>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[11px] font-black text-cyan-100">
                    {pipeline.confidence || 84}% confidence
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {[
                    "Extract Garment",
                    "Detect Body Landmarks",
                    "Build Body Mask",
                    "Fit Garment",
                    "Render Try-On",
                  ].map((stage, index) => (
                    <div
                      key={stage}
                      className="flex items-center gap-2 rounded-xl border border-stone-200/10 bg-stone-100/[0.025] px-3 py-2 text-xs font-bold text-stone-300"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-black">
                        <CheckCircle2 size={13} />
                      </span>
                      {stage}
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2 text-xs font-semibold leading-5 text-stone-400">
                  {pipeline.focus && <p>Focus: {pipeline.focus}</p>}
                  {pipeline.crop_strategy && <p>Crop: {pipeline.crop_strategy}</p>}
                  {pipeline.mask_strategy && <p>Mask: {pipeline.mask_strategy}</p>}
                  {pipeline.overlay_strategy && <p>Overlay: {pipeline.overlay_strategy}</p>}
                </div>
              </div>

              {dominantColors.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {dominantColors.slice(0, 4).map((color) => (
                    <span
                      key={color}
                      className="rounded-full border border-stone-200/10 bg-black/30 px-3 py-1.5 text-xs font-black text-stone-300"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={onSave}
                className="button-press mt-3 w-full rounded-2xl border border-stone-200/10 bg-stone-100/[0.08] px-3 py-2.5 text-sm font-black text-stone-100 hover:-translate-y-0.5 hover:border-stone-100/30"
              >
                Save Look
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_10%,rgba(34,211,238,0.14),transparent_34%),rgba(0,0,0,0.28)] p-4 text-left shadow-xl shadow-black/20">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                  {previewMode.title}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-stone-400">
                  {previewMode.subtitle}
                </p>
              </div>
              <span className="rounded-full border border-[#d6c2a1]/25 bg-[#d6c2a1]/10 px-3 py-2 text-xs font-black text-[#e6d8c3]">
                AI try-on simulation preview
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-stone-200/10 bg-black/35 p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-stone-500">
                  Before
                </p>
                <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-gradient-to-b from-stone-800 to-black">
                  <div className="relative h-[78%] w-[48%] rounded-t-full bg-stone-700/80 shadow-2xl shadow-black/40">
                    <div className="absolute left-1/2 top-2 h-12 w-12 -translate-x-1/2 rounded-full bg-stone-500" />
                    <div className="absolute left-1/2 top-16 h-36 w-24 -translate-x-1/2 rounded-[42%_42%_20%_20%] border border-stone-200/10 bg-stone-600/60" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-300/15 bg-black/35 p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                  AI Try-On
                </p>
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-cyan-950/45 to-black">
                  <div
                    className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px)]"
                    style={{ backgroundSize: "28px 28px" }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(214,194,161,0.16),transparent_30%)]" />
                  <div className="relative h-[78%] w-[50%] rounded-t-full bg-stone-700/80 shadow-2xl shadow-black/40">
                    <div className="absolute left-1/2 top-2 h-12 w-12 -translate-x-1/2 rounded-full bg-stone-500" />
                    <div
                      className="absolute left-1/2 top-[74px] h-36 w-36 -translate-x-1/2 overflow-hidden rounded-[38%_38%_18%_18%] opacity-95 shadow-2xl shadow-black/55 ring-1 ring-white/25"
                      style={{
                        clipPath:
                          "polygon(12% 10%, 31% 0, 50% 12%, 69% 0, 88% 10%, 82% 100%, 18% 100%)",
                      }}
                    >
                      <div
                        className="absolute inset-0 scale-125 bg-cover bg-center opacity-40 mix-blend-screen"
                        style={{ backgroundImage: `url(${product.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#f6f1e5]/72 via-[#d6c2a1]/52 to-stone-950/72" />
                      <div className="absolute inset-x-3 top-12 h-16 rounded-full border border-white/10 bg-white/10 blur-xl" />
                      <div className="absolute inset-y-3 left-2 w-10 rounded-full bg-white/12 blur-lg" />
                      <div className="absolute inset-y-3 right-2 w-10 rounded-full bg-black/24 blur-lg" />
                      <div className="absolute left-1/2 top-2 h-8 w-14 -translate-x-1/2 rounded-b-full bg-black/34" />
                      <div className="absolute inset-x-5 top-16 h-px bg-white/20" />
                      <div className="absolute inset-x-6 bottom-5 h-5 rounded-full bg-black/15 blur-sm" />
                    </div>
                    <div className="absolute left-1/2 top-[72px] h-40 w-44 -translate-x-1/2 rounded-[38%_38%_18%_18%] border border-cyan-200/20 opacity-70" />
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-full border border-cyan-300/20 bg-black/65 px-3 py-2 text-[11px] font-black text-cyan-100 backdrop-blur">
                    Upper body fit preview
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-stone-200/10 bg-black/30 p-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d6c2a1]">
                Simulation transparency
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-300">
                {FOCUS_COPY[category] || FOCUS_COPY.Shirts} This is an AI try-on simulation preview, so it shows alignment and fit direction without claiming a fully generated garment render.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[26px] border border-stone-200/10 bg-black/28 text-left">
          <button
            type="button"
            onClick={() => setRecruiterOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d6c2a1]">
                Recruiter Mode
              </p>
              <h3 className="mt-1 text-lg font-black text-stone-50">
                How AI Stylist Works
              </h3>
            </div>
            <ChevronDown
              size={20}
              className={`shrink-0 text-[#e6d8c3] transition ${recruiterOpen ? "rotate-180" : ""}`}
            />
          </button>

          {recruiterOpen && (
            <div className="grid gap-3 border-t border-stone-200/10 p-4 md:grid-cols-2 xl:grid-cols-3">
              {RECRUITER_WORKFLOW.map(([title, text], index) => (
                <div
                  key={title}
                  className="rounded-2xl border border-stone-200/10 bg-stone-100/[0.03] p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e6d8c3] text-xs font-black text-black">
                      {index + 1}
                    </span>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-100">
                      {title}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-stone-400">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductPreview;

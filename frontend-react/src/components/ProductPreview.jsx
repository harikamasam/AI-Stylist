import { useProductExtraction } from "../hooks/useProductExtraction";

function ProductPreview({ productUrl, setProductUrl, onSave }) {
  const { product, loading, error } = useProductExtraction(productUrl);

  return (
    <section className="rounded-[28px] border border-stone-200/10 bg-[#11100e]/90 p-4 shadow-2xl shadow-black/25 backdrop-blur sm:p-5">
      <div className="mb-3">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d6c2a1]">
          Product Lens
        </p>
        <h2 className="mt-2 text-xl font-black">AI Preview</h2>
      </div>

      <input
        type="text"
        placeholder="Paste Myntra / Amazon / Ajio URL"
        value={productUrl}
        onChange={(e) => setProductUrl(e.target.value)}
        className="mb-3 w-full rounded-2xl border border-stone-200/10 bg-black/35 p-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-[#d6c2a1]/60 focus:ring-2 focus:ring-[#d6c2a1]/10"
      />

      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 shadow-xl shadow-black/20">
        <img
          src={product.image}
          alt={product.title}
          className="h-[160px] w-full object-cover transition duration-500 hover:scale-[1.02] sm:h-[190px] xl:h-[210px]"
        />

        {loading && (
          <div className="fashion-shimmer absolute inset-0 backdrop-blur-[1px]" />
        )}
      </div>

      <div className="mt-3">
        <h2 className="text-lg font-black">{product.title}</h2>

        <p className="mt-1 text-2xl font-black text-[#e6d8c3]">
          {loading ? "Checking..." : product.price}
        </p>

        {error && <p className="text-rose-300 font-bold mt-2">{error}</p>}

        <p className="mt-1 text-sm text-stone-400">
          Brand:
          <span className="text-white ml-2 font-bold">{product.brand}</span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-2xl bg-stone-100 px-3 py-2.5 text-sm font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-[#e6d8c3]"
          >
            Start Try-On
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-2xl border border-stone-200/10 bg-stone-100/[0.035] px-3 py-2.5 text-sm font-black text-stone-100 transition duration-300 hover:-translate-y-0.5 hover:border-stone-100/30"
          >
            Save
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductPreview;

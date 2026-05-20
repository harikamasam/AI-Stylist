function StyleSelector({ styles, style, setStyle, compact = false }) {
  return (
    <section className={compact ? "" : "mt-5 border-t border-stone-200/10 pt-5"}>
      <h2 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-stone-500">
        Select Fashion Style
      </h2>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {styles.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStyle(item)}
            className={`rounded-2xl px-4 py-2.5 text-sm font-black transition duration-300 hover:-translate-y-0.5 sm:px-5 ${
              style === item
                ? "bg-[#e6d8c3] text-black shadow-lg shadow-stone-100/10"
                : "border border-stone-200/10 bg-stone-100/[0.035] text-stone-300 hover:border-stone-100/30 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

export default StyleSelector;

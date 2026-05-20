function ProductTabs({ categories, category, setCategory }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {categories.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setCategory(item)}
          className={`rounded-2xl px-4 py-2.5 text-sm font-black transition duration-300 hover:-translate-y-0.5 sm:px-5 ${
            category === item
              ? "bg-stone-100 text-black shadow-lg shadow-stone-100/10"
              : "border border-stone-200/10 bg-stone-100/[0.035] text-stone-300 hover:border-stone-100/30 hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default ProductTabs;

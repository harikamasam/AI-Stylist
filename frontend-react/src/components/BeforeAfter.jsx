import ReactCompareImage from "react-compare-image";

function BeforeAfter() {
  return (
    <section className="soft-ring rounded-[28px] border border-stone-200/10 bg-[#11100e]/90 p-4 backdrop-blur sm:p-5">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d6c2a1]">
          Transformation
        </p>
        <h2 className="mt-2 text-xl font-black sm:text-2xl">
          Before vs After
        </h2>
      </div>

      <div className="relative max-h-[330px] overflow-hidden rounded-2xl border border-stone-200/10 bg-zinc-900 shadow-inner shadow-black/40">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between p-4">
          <span className="rounded-full border border-white/10 bg-black/70 px-3 py-2 text-xs font-black tracking-[0.18em] text-gray-200 backdrop-blur">
            BEFORE
          </span>
          <span className="rounded-full border border-[#d6c2a1]/30 bg-[#d6c2a1]/15 px-3 py-2 text-xs font-black tracking-[0.18em] text-[#f4ead7] backdrop-blur">
            AI TRY-ON
          </span>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_65%_35%,rgba(214,194,161,0.18),transparent_34%)]" />

        <ReactCompareImage
          leftImage="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
          rightImage="https://images.unsplash.com/photo-1529139574466-a303027c1d8b"
          sliderLineColor="rgba(214,194,161,0.95)"
          handle={
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e6d8c3]/60 bg-black/80 text-[#f4ead7] shadow-2xl shadow-black/50 backdrop-blur">
              <div className="h-5 w-1 rounded-full bg-[#e6d8c3]" />
            </div>
          }
        />
      </div>
    </section>
  );
}

export default BeforeAfter;

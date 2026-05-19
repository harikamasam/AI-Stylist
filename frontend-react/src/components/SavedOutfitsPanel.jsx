import { Bookmark, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function SavedOutfitsPanel({ onLogin }) {
  const { savedOutfits, toggleFavorite, user } = useAuth();

  return (
    <section className="rounded-[28px] border border-white/10 bg-zinc-950/90 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5 lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
            Protected Wardrobe
          </p>
          <h2 className="mt-2 text-2xl font-black">Saved Outfits</h2>
        </div>
        <Bookmark className="text-cyan-300" size={24} />
      </div>

      {!user ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold leading-6 text-gray-300">
            Sign in to save outfits, favorite recommendations, and build a
            private styling history.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="mt-4 rounded-2xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-white"
          >
            Sign in to unlock
          </button>
        </div>
      ) : savedOutfits.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-gray-300">
          No saved looks yet. Save a recommendation to start your outfit history.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {savedOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80"
            >
              <img
                src={outfit.image}
                alt={outfit.title}
                className="h-28 w-full object-cover"
              />
              <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{outfit.title}</h3>
                    <p className="text-xs font-bold text-gray-400">
                      {outfit.category} / {outfit.style}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(outfit.id)}
                    className={`rounded-full border p-2 transition ${
                      outfit.favorite
                        ? "border-cyan-300/40 bg-cyan-300 text-black"
                        : "border-white/10 text-gray-300 hover:border-cyan-300/40"
                    }`}
                    aria-label="Favorite saved outfit"
                  >
                    <Heart size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SavedOutfitsPanel;

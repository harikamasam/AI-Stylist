import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function UserMenu({ onLogin }) {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <button
        type="button"
        onClick={onLogin}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300 px-4 py-2.5 text-sm font-black text-black shadow-lg shadow-cyan-500/20 transition hover:bg-white"
      >
        <LogIn size={16} />
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <img
        src={user.photoURL || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"}
        alt={user.displayName || "User"}
        className="h-9 w-9 rounded-full border border-cyan-300/30 object-cover"
      />
      <div className="hidden text-left sm:block">
        <p className="text-sm font-black text-white">{user.displayName || "Stylist User"}</p>
        <p className="text-xs font-bold text-gray-400">Saved looks enabled</p>
      </div>
      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-cyan-300/40 hover:text-white"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

export default UserMenu;

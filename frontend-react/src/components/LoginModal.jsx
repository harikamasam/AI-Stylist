import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function LoginModal({ open, onClose }) {
  const { authError, firebaseConfigured, signInWithGoogle } = useAuth();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 backdrop-blur">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-zinc-950 p-6 shadow-2xl shadow-cyan-950/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
              AI Stylist Account
            </p>
            <h2 className="mt-2 text-2xl font-black">Sign in to save looks</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-cyan-300/40 hover:text-white"
            aria-label="Close login modal"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-300">
          Save outfit history, favorite recommendations, and keep your AI styling
          preferences protected behind Google login.
        </p>

        {!firebaseConfigured && (
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm font-bold text-amber-100">
            Add Firebase environment variables to enable live Google sign-in.
          </div>
        )}

        {authError && (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm font-bold text-rose-100">
            {authError}
          </div>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-6 w-full rounded-2xl bg-white px-5 py-3 font-black text-black transition hover:bg-cyan-200"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default LoginModal;

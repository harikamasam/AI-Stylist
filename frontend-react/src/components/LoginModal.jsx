import {
  Bookmark,
  History,
  Shield,
  Shirt,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const WARDROBE_FEATURES = [
  {
    Icon: Shirt,
    title: "AI Wardrobe",
    description: "Curated pieces matched to your style profile",
  },
  {
    Icon: Bookmark,
    title: "Saved Looks",
    description: "Favorite outfits and try-on previews in one place",
  },
  {
    Icon: History,
    title: "Style History",
    description: "Track verdicts and recommendations over time",
  },
];

function GoogleMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function getFriendlyAuthError(authError) {
  if (!authError) return "";

  const message = authError.toLowerCase();

  if (
    message.includes("firebase credentials") ||
    message.includes("not configured") ||
    (message.includes("firebase") && message.includes("config"))
  ) {
    return "";
  }

  if (message.includes("firebase") || message.includes("initialize")) {
    return "We couldn't complete sign-in. Please try again.";
  }

  if (
    message.includes("popup-closed") ||
    message.includes("cancelled") ||
    message.includes("canceled")
  ) {
    return "Sign-in was cancelled. You can try again anytime.";
  }

  if (message.includes("network") || message.includes("offline")) {
    return "Connection issue. Check your network and try again.";
  }

  if (message.includes("account-exists")) {
    return "This email is linked to another sign-in method. Try Google again.";
  }

  return "We couldn't complete sign-in. Please try again.";
}

function LoginModal({ open, onClose }) {
  const { authError, firebaseConfigured, signInWithGoogle, clearAuthError } =
    useAuth();

  if (!open) return null;

  const friendlyError = firebaseConfigured ? getFriendlyAuthError(authError) : "";
  const loginUnavailable = !firebaseConfigured;

  const handleClose = () => {
    clearAuthError?.();
    onClose();
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={handleClose}
        aria-label="Close login"
      />

      <div
        className="modal-enter relative max-h-[calc(100vh-2rem)] w-full max-w-[920px] overflow-y-auto rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/50 sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-secondary/50 text-muted-foreground transition hover:border-cyan-500/30 hover:text-primary sm:right-4 sm:top-4"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.92fr)]">
          <div className="order-2 border-t border-border/40 p-6 sm:p-8 lg:order-1 lg:border-t-0 lg:border-r lg:border-r-border/40">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <span className="text-lg font-bold text-primary">A</span>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
                  AI Stylist
                </p>
                <p className="text-sm text-muted-foreground">Your personal style studio</p>
              </div>
            </div>

            <h2
              id="login-modal-title"
              className="mt-6 text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
            >
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Save your outfits, favorites, and styling history.
            </p>

            {loginUnavailable ? (
              <div
                className="mt-6 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground"
                role="status"
              >
                Sign in will be enabled soon.
              </div>
            ) : (
              friendlyError && (
                <div
                  className="mt-6 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200/90"
                  role="alert"
                >
                  {friendlyError}
                </div>
              )
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loginUnavailable}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border/80 bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary"
            >
              <GoogleMark />
              Continue with Google
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0 text-cyan-400/80" aria-hidden />
              Secure Google login - Your wardrobe stays private
            </p>

            <p className="mt-6 text-center text-xs text-muted-foreground/80">
              By continuing, you agree to save style data locally to your account.
            </p>
          </div>

          <div className="order-1 relative overflow-hidden bg-gradient-to-br from-cyan-950/40 via-secondary/80 to-background p-6 sm:p-8 lg:order-2">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-cyan-400/5 blur-2xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Member benefits
              </div>

              <h3 className="mt-4 text-lg font-semibold text-primary sm:text-xl">
                Your style, organized
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything you save syncs to your signed-in wardrobe.
              </p>

              <ul className="mt-6 space-y-3">
                {WARDROBE_FEATURES.map(({ Icon, title, description }) => (
                  <li
                    key={title}
                    className="glass flex items-start gap-3 rounded-xl border border-border/40 p-3.5 transition hover:border-cyan-500/20"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                      <Icon className="h-5 w-5 text-cyan-400" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-primary">
                        {title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;

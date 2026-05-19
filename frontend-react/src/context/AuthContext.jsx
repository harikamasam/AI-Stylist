import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { firebaseConfig, firebaseConfigured } from "../firebase";

const AuthContext = createContext(null);
const FIREBASE_APP_SCRIPT =
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js";
const FIREBASE_AUTH_SCRIPT =
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function getFirebaseAuth() {
  if (!firebaseConfigured) {
    throw new Error("Firebase credentials are not configured yet.");
  }

  await loadScript(FIREBASE_APP_SCRIPT);
  await loadScript(FIREBASE_AUTH_SCRIPT);

  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }

  return window.firebase.auth();
}

function getStorageKey(user) {
  return `aistylist:saved-outfits:${user?.uid || "guest"}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [savedOutfits, setSavedOutfits] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;

    async function subscribeToAuth() {
      if (!firebaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const firebaseAuth = await getFirebaseAuth();

        if (!active) return;

        unsubscribe = firebaseAuth.onAuthStateChanged((currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
      } catch (error) {
        if (active) {
          setAuthError(error.message || "Unable to initialize Firebase Auth.");
          setLoading(false);
        }
      }
    }

    subscribeToAuth();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedOutfits([]);
      return;
    }

    const stored = window.localStorage.getItem(getStorageKey(user));
    setSavedOutfits(stored ? JSON.parse(stored) : []);
  }, [user]);

  const persistOutfits = useCallback(
    (nextOutfits) => {
      if (!user) return;

      setSavedOutfits(nextOutfits);
      window.localStorage.setItem(getStorageKey(user), JSON.stringify(nextOutfits));
    },
    [user]
  );

  const signInWithGoogle = useCallback(async () => {
    setAuthError("");

    if (!firebaseConfigured) {
      setAuthError("Firebase credentials are not configured yet.");
      return;
    }

    try {
      const firebaseAuth = await getFirebaseAuth();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      await firebaseAuth.signInWithPopup(provider);
    } catch (error) {
      setAuthError(error.message || "Unable to sign in with Google.");
    }
  }, []);

  const signOut = useCallback(async () => {
    const firebaseAuth = await getFirebaseAuth();
    await firebaseAuth.signOut();
  }, []);

  const saveOutfit = useCallback(
    (outfit) => {
      if (!user) {
        setAuthError("Sign in to save outfits.");
        return false;
      }

      const saved = {
        ...outfit,
        id: `${Date.now()}-${outfit.title}`,
        savedAt: new Date().toISOString(),
        favorite: false,
      };

      persistOutfits([saved, ...savedOutfits].slice(0, 12));
      return true;
    },
    [persistOutfits, savedOutfits, user]
  );

  const toggleFavorite = useCallback(
    (id) => {
      persistOutfits(
        savedOutfits.map((outfit) =>
          outfit.id === id ? { ...outfit, favorite: !outfit.favorite } : outfit
        )
      );
    },
    [persistOutfits, savedOutfits]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      firebaseConfigured,
      savedOutfits,
      signInWithGoogle,
      signOut,
      saveOutfit,
      toggleFavorite,
      clearAuthError: () => setAuthError(""),
    }),
    [
      user,
      loading,
      authError,
      savedOutfits,
      signInWithGoogle,
      signOut,
      saveOutfit,
      toggleFavorite,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

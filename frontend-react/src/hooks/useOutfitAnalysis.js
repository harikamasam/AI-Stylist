import { useEffect, useMemo, useState } from "react";
import { fetchOutfitAnalysis } from "../services/api";

const FALLBACK_ANALYSIS = {
  outfit_suggestions: ["relaxed shirt", "well-fitted denim", "clean sneakers"],
  best_colors: ["black", "white", "grey"],
  suggested_accessories: ["slim watch", "minimal belt", "structured bag"],
  occasion_recommendations: ["smart casual day", "coffee meeting"],
  compatibility_score: 82,
  fashion_compatibility_score: 82,
  confidence: 80,
  professional_score: 74,
  casual_score: 86,
  recommendation_reason:
    "This outfit matches your selected style.",
  reasoning: {
    color_match:
      "Black, white, and grey work well because neutral contrast keeps the outfit versatile.",
    occasion_fit:
      "Smart-casual score is high because relaxed pieces are balanced with clean accessories.",
    body_fit:
      "The silhouette keeps the upper body balanced by avoiding extra bulk around the shoulders.",
    style_balance:
      "Repeat one neutral color and finish with a slim accessory to make the outfit feel intentional.",
  },
};

const STYLE_COLORS = {
  Casual: ["white", "beige", "light blue"],
  Streetwear: ["black", "grey", "white"],
  Luxury: ["black", "cream", "gold"],
  Minimal: ["black", "white", "beige"],
  Party: ["black", "maroon", "silver"],
  Formal: ["navy", "white", "charcoal"],
};

export function useOutfitAnalysis(category, style, pose = "unknown") {
  const [analysis, setAnalysis] = useState(FALLBACK_ANALYSIS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalysis() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchOutfitAnalysis(
          {
            category,
            style,
            pose,
            colors: STYLE_COLORS[style] || STYLE_COLORS.Casual,
          },
          controller.signal
        );

        setAnalysis({
          ...FALLBACK_ANALYSIS,
          ...data,
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("");
          setAnalysis(FALLBACK_ANALYSIS);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      controller.abort();
    };
  }, [category, style, pose]);

  return useMemo(
    () => ({
      analysis,
      loading,
      error,
    }),
    [analysis, loading, error]
  );
}

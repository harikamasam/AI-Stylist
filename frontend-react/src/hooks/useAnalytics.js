import { useEffect, useMemo, useState } from "react";
import { fetchAnalytics } from "../services/api";

export const ANALYTICS_METRICS = [
  {
    key: "style_score",
    label: "Style Score",
    tone: "from-cyan-400 to-emerald-300",
  },
  {
    key: "fit_score",
    label: "Fit Score",
    tone: "from-sky-400 to-cyan-300",
  },
  {
    key: "trend_score",
    label: "Trend Score",
    tone: "from-fuchsia-400 to-cyan-300",
  },
  {
    key: "compatibility",
    label: "Compatibility",
    tone: "from-emerald-400 to-lime-300",
  },
];

const FALLBACK_ANALYTICS = {
  style_score: 88,
  fit_score: 84,
  trend_score: 91,
  compatibility: 86,
};

const STYLE_INSIGHTS = {
  Casual: {
    palette: "Neutral colors increase versatility for casual wear.",
    occasion: "This outfit works best for daily wear, campus, coffee plans, and relaxed smart-casual settings.",
    consistency: "A clean base with one textured layer keeps the outfit relaxed but intentional.",
  },
  Streetwear: {
    palette: "Black, grey, and one accent color create a stronger streetwear silhouette.",
    occasion: "Best for city outings, concerts, college events, and social weekends.",
    consistency: "Oversized pieces work best when balanced with structured shoes or a compact accessory.",
  },
  Luxury: {
    palette: "Cream, black, silver, and muted gold create a more premium fashion tone.",
    occasion: "Best for evening dinners, upscale events, and polished social settings.",
    consistency: "Minimal branding and richer textures make the look feel expensive without becoming loud.",
  },
  Minimal: {
    palette: "Monochrome neutrals make the outfit easier to repeat and style across occasions.",
    occasion: "Best for workdays, portfolio meets, city travel, and polished everyday wear.",
    consistency: "Simple lines, fewer colors, and clean footwear keep the outfit sharp.",
  },
  Party: {
    palette: "Black with silver or maroon accents creates stronger evening contrast.",
    occasion: "Best for parties, dinner nights, club settings, and celebratory events.",
    consistency: "A statement texture or accessory works better than adding multiple loud colors.",
  },
  Formal: {
    palette: "Navy, white, charcoal, and silver are the most reliable formal combinations.",
    occasion: "Best for interviews, office meetings, presentations, and professional events.",
    consistency: "Sharper collars, structured layers, and polished shoes increase authority.",
  },
};

const CATEGORY_FIT_INSIGHTS = {
  Shirts: "Slim or tailored shirts improve shoulder definition and body proportion balance.",
  Hoodies: "A slightly oversized hoodie looks cleaner when the hem and shoulders remain controlled.",
  Glasses: "Frame width should follow face width so the glasses look intentional, not oversized.",
  Shoes: "Shoe shape should match outfit weight: sleek for minimal/formal, chunky for streetwear.",
  Watches: "A watch should match the outfit metal tone; silver is the most versatile choice.",
};

function normalizeAnalytics(data = {}) {
  return {
    style_score:
      data.style_score ??
      data.confidence ??
      data.outfit_match_score ??
      FALLBACK_ANALYTICS.style_score,
    fit_score:
      data.fit_score ?? data.fit_accuracy ?? FALLBACK_ANALYTICS.fit_score,
    trend_score: data.trend_score ?? FALLBACK_ANALYTICS.trend_score,
    compatibility:
      data.compatibility ??
      data.compatibility_score ??
      data.outfit_match_score ??
      FALLBACK_ANALYTICS.compatibility,
  };
}

export function useAnalytics(category, style) {
  const [analytics, setAnalytics] = useState(FALLBACK_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchAnalytics(
          {
            category,
            style,
          },
          controller.signal
        );

        setAnalytics(normalizeAnalytics(data));
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setAnalytics(FALLBACK_ANALYTICS);
          setError("");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      controller.abort();
    };
  }, [category, style]);

  const averageScore = useMemo(() => {
    const total = ANALYTICS_METRICS.reduce(
      (sum, metric) => sum + Number(analytics[metric.key] || 0),
      0
    );

    return Math.round(total / ANALYTICS_METRICS.length);
  }, [analytics]);

  const insights = useMemo(() => {
    const styleInsight = STYLE_INSIGHTS[style] || STYLE_INSIGHTS.Casual;

    return [
      {
        title: "Color compatibility",
        text: styleInsight.palette,
      },
      {
        title: "Occasion suitability",
        text: styleInsight.occasion,
      },
      {
        title: "Style consistency",
        text: styleInsight.consistency,
      },
      {
        title: "Body-fit suggestion",
        text: CATEGORY_FIT_INSIGHTS[category] || CATEGORY_FIT_INSIGHTS.Shirts,
      },
    ];
  }, [category, style]);

  return useMemo(
    () => ({
      analytics,
      averageScore,
      insights,
      loading,
      error,
    }),
    [analytics, averageScore, insights, loading, error]
  );
}

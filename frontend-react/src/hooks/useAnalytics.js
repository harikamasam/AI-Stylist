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
  Shirts: "This silhouette balances the upper body by keeping the shoulder line clean and reducing visual bulk around the torso.",
  Hoodies: "A slightly oversized hoodie looks cleaner when the hem and shoulders remain controlled, so volume feels intentional instead of heavy.",
  Glasses: "Frame width should follow face width so the glasses look intentional, not oversized.",
  Shoes: "Shoe shape should match outfit weight: sleek for minimal/formal, chunky for streetwear.",
  Watches: "A watch should match the outfit metal tone; silver is the most versatile choice.",
};

const STYLE_BALANCE_REASONS = {
  Casual:
    "Smart-casual score is stronger when relaxed pieces are grounded with one clean, structured detail.",
  Streetwear:
    "Streetwear works when oversized shapes are balanced by footwear weight and a tight color palette.",
  Luxury:
    "Luxury reads best when texture, polish, and restrained branding do more work than loud logos.",
  Minimal:
    "Minimal style depends on proportion and repetition: fewer colors make fit quality more visible.",
  Party:
    "Party styling benefits from a dark base with one statement texture or metal accent for evening contrast.",
  Formal:
    "For interviews and meetings, low-contrast colors and clean accessories create a professional impression.",
};

const STYLE_CONSISTENCY = {
  Casual:
    "The relaxed silhouette, easy palette, and simple accessories align with casual styling without looking unfinished.",
  Streetwear:
    "The outfit supports streetwear through volume control, stronger footwear weight, and a compact color story.",
  Luxury:
    "The look reads luxury when richer textures, restrained branding, and polished accessories carry the outfit.",
  Minimal:
    "The neutral colors and clean lines strongly align with minimalist fashion principles.",
  Party:
    "The darker base and statement accent create a clearer evening mood without adding too many competing details.",
  Formal:
    "Structured layers, low-contrast colors, and polished accessories keep the outfit consistent with formal dressing.",
};

const OCCASION_RULES = {
  Formal: {
    interview: ["Excellent", 94],
    business: ["Excellent", 92],
    wedding: ["Strong", 84],
    party: ["Moderate", 72],
  },
  Minimal: {
    interview: ["Strong", 88],
    business: ["Excellent", 91],
    wedding: ["Moderate", 76],
    party: ["Moderate", 74],
  },
  Luxury: {
    interview: ["Strong", 84],
    business: ["Strong", 86],
    wedding: ["Excellent", 93],
    party: ["Strong", 88],
  },
  Streetwear: {
    interview: ["Moderate", 70],
    business: ["Moderate", 72],
    wedding: ["Moderate", 68],
    party: ["Strong", 86],
  },
  Party: {
    interview: ["Moderate", 68],
    business: ["Moderate", 70],
    wedding: ["Strong", 84],
    party: ["Excellent", 94],
  },
  Casual: {
    interview: ["Moderate", 74],
    business: ["Strong", 82],
    wedding: ["Moderate", 72],
    party: ["Strong", 80],
  },
};

function describePalette(colors, style) {
  const palette = colors.length ? colors.slice(0, 3).join(", ") : "black, beige, and white";
  const lower = colors.map((color) => color.toLowerCase());

  if (lower.includes("black") && (lower.includes("beige") || lower.includes("cream"))) {
    return `${palette} create a balanced neutral palette that works well in professional and smart-casual environments.`;
  }

  if (lower.includes("blue") || lower.includes("navy") || lower.includes("light blue")) {
    return `${palette} provide clean contrast suitable for formal occasions and interview-ready outfits.`;
  }

  if (style === "Party") {
    return `${palette} create stronger evening contrast, especially when one accessory tone repeats across the look.`;
  }

  return `${palette} keep the outfit cohesive because the dominant colors share a clear styling direction.`;
}

function buildExplainableAnalysis(category, style, colors, analytics, tryOnMetrics, apiAnalysis) {
  if (apiAnalysis?.color_harmony && apiAnalysis?.occasion_analysis) {
    return apiAnalysis;
  }

  const rules = OCCASION_RULES[style] || OCCASION_RULES.Casual;
  const hasLandmarks = Boolean(tryOnMetrics.landmarksDetected);
  const bodyScore = hasLandmarks
    ? tryOnMetrics.fitConfidence || tryOnMetrics.confidence || analytics.fit_score
    : analytics.fit_score;
  const bodyReason = hasLandmarks
    ? `The live mirror reads ${tryOnMetrics.shoulderFit}% shoulder fit and ${tryOnMetrics.torsoCoverage}% torso coverage, so the garment is being evaluated against upper-body proportions instead of a generic score.`
    : CATEGORY_FIT_INSIGHTS[category] || CATEGORY_FIT_INSIGHTS.Shirts;

  return {
    color_harmony: {
      verdict: analytics.compatibility >= 88 ? "Excellent" : analytics.compatibility >= 80 ? "Strong" : "Moderate",
      score: analytics.compatibility,
      reason: describePalette(colors, style),
    },
    occasion_analysis: [
      {
        label: "Interview Fit",
        verdict: rules.interview[0],
        score: rules.interview[1],
        reason:
          "The score favors low-contrast palettes, structured silhouettes, and minimal accessories that look appropriate in technical interviews.",
      },
      {
        label: "Business Casual Fit",
        verdict: rules.business[0],
        score: rules.business[1],
        reason:
          "The outfit works for business casual when relaxed pieces are balanced with clean footwear, controlled colors, and one polished detail.",
      },
      {
        label: "Wedding/Event Fit",
        verdict: rules.wedding[0],
        score: rules.wedding[1],
        reason:
          "Event suitability improves when the palette feels elevated and the product does not look too sporty or underdressed.",
      },
      {
        label: "Party Fit",
        verdict: rules.party[0],
        score: rules.party[1],
        reason:
          "Party fit rewards stronger contrast, a clear statement texture, and accessories that add energy without cluttering the outfit.",
      },
    ],
    body_balance: {
      verdict: bodyScore >= 90 ? "Excellent" : bodyScore >= 80 ? "Strong" : "Moderate",
      score: bodyScore,
      reason: bodyReason,
    },
    style_consistency: {
      verdict: analytics.style_score >= 90 ? "Excellent" : analytics.style_score >= 82 ? "Strong" : "Moderate",
      score: analytics.style_score,
      reason: STYLE_CONSISTENCY[style] || STYLE_CONSISTENCY.Casual,
    },
  };
}

function buildReasonCards(category, style, analytics, apiReasoning = {}, tryOnMetrics = {}) {
  const styleInsight = STYLE_INSIGHTS[style] || STYLE_INSIGHTS.Casual;
  const colorReason =
    style === "Minimal"
      ? "Black, white, and beige work well because neutral contrast keeps the outfit versatile and easy to repeat."
      : styleInsight.palette;
  const hasLandmarks = Boolean(tryOnMetrics.landmarksDetected);
  const bodyFitReason = hasLandmarks
    ? `MediaPipe landmarks show ${tryOnMetrics.alignment} shoulder alignment with ${tryOnMetrics.shoulder} shoulder width, ${tryOnMetrics.chest} chest estimate, and ${tryOnMetrics.bodyScale} body scale. The overlay uses smoothing to keep the garment stable while preserving torso proportions.`
    : CATEGORY_FIT_INSIGHTS[category] || CATEGORY_FIT_INSIGHTS.Shirts;

  return [
    {
      title: "Color Match Reason",
      text: apiReasoning.color_match || colorReason,
      score: analytics.compatibility,
    },
    {
      title: "Occasion Fit Reason",
      text: apiReasoning.occasion_fit || styleInsight.occasion,
      score: analytics.style_score,
    },
    {
      title: "Body Fit Reason",
      text: hasLandmarks ? bodyFitReason : apiReasoning.body_fit || bodyFitReason,
      score: analytics.fit_score,
    },
    {
      title: "Styling Suggestion",
      text:
        apiReasoning.style_balance ||
        STYLE_BALANCE_REASONS[style] ||
        STYLE_BALANCE_REASONS.Casual,
      score: analytics.trend_score,
    },
  ];
}

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

function adjustWithTryOnMetrics(analytics, tryOnMetrics = {}) {
  if (!tryOnMetrics.landmarksDetected) {
    return analytics;
  }

  const confidence = Number(tryOnMetrics.confidence || 0);
  const alignmentPenalty = tryOnMetrics.alignment === "tilted" ? -3 : 2;
  const fitLift = Math.round((confidence - 82) / 4) + alignmentPenalty;

  return {
    ...analytics,
    fit_score: Math.max(70, Math.min(99, analytics.fit_score + fitLift)),
    compatibility: Math.max(
      70,
      Math.min(99, analytics.compatibility + Math.round(fitLift / 2))
    ),
  };
}

export function useAnalytics(
  category,
  style,
  colors = [],
  pose = "unknown",
  tryOnMetrics = {}
) {
  const [analytics, setAnalytics] = useState(FALLBACK_ANALYTICS);
  const [apiReasoning, setApiReasoning] = useState({});
  const [apiExplainableAnalysis, setApiExplainableAnalysis] = useState(null);
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
            colors,
            pose,
          },
          controller.signal
        );

        setAnalytics(normalizeAnalytics(data));
        setApiReasoning(data?.reasoning || {});
        setApiExplainableAnalysis(data?.explainable_analysis || null);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setAnalytics(FALLBACK_ANALYTICS);
          setApiReasoning({});
          setApiExplainableAnalysis(null);
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
  }, [category, colors, pose, style]);

  const adjustedAnalytics = useMemo(
    () => adjustWithTryOnMetrics(analytics, tryOnMetrics),
    [analytics, tryOnMetrics]
  );

  const averageScore = useMemo(() => {
    const total = ANALYTICS_METRICS.reduce(
      (sum, metric) => sum + Number(adjustedAnalytics[metric.key] || 0),
      0
    );

    return Math.round(total / ANALYTICS_METRICS.length);
  }, [adjustedAnalytics]);

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

  const reasonCards = useMemo(
    () =>
      buildReasonCards(
        category,
        style,
        adjustedAnalytics,
        apiReasoning,
        tryOnMetrics
      ),
    [adjustedAnalytics, apiReasoning, category, style, tryOnMetrics]
  );

  const explainableAnalysis = useMemo(
    () =>
      buildExplainableAnalysis(
        category,
        style,
        colors,
        adjustedAnalytics,
        tryOnMetrics,
        apiExplainableAnalysis
      ),
    [adjustedAnalytics, apiExplainableAnalysis, category, colors, style, tryOnMetrics]
  );

  return useMemo(
    () => ({
      analytics: adjustedAnalytics,
      averageScore,
      insights,
      reasonCards,
      explainableAnalysis,
      loading,
      error,
    }),
    [
      adjustedAnalytics,
      averageScore,
      insights,
      reasonCards,
      explainableAnalysis,
      loading,
      error,
    ]
  );
}

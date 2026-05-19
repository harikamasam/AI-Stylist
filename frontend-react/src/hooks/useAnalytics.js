import { useEffect, useMemo, useState } from "react";
import { fetchAnalytics } from "../services/api";

export const ANALYTICS_METRICS = [
  {
    key: "fit_accuracy",
    label: "Fit Accuracy",
    tone: "from-cyan-400 to-emerald-300",
  },
  {
    key: "pose_tracking",
    label: "Pose Tracking",
    tone: "from-sky-400 to-cyan-300",
  },
  {
    key: "trend_score",
    label: "Trend Score",
    tone: "from-fuchsia-400 to-cyan-300",
  },
  {
    key: "confidence",
    label: "Confidence",
    tone: "from-emerald-400 to-lime-300",
  },
  {
    key: "professional_score",
    label: "Professional Score",
    tone: "from-violet-400 to-cyan-300",
  },
  {
    key: "outfit_match_score",
    label: "Outfit Match",
    tone: "from-pink-400 to-cyan-300",
  },
];

const EMPTY_ANALYTICS = ANALYTICS_METRICS.reduce((scores, metric) => {
  scores[metric.key] = 0;
  return scores;
}, {});

export function useAnalytics(category, style) {
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
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

        setAnalytics({
          ...EMPTY_ANALYTICS,
          ...data,
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("Analytics temporarily unavailable");
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

  return useMemo(
    () => ({
      analytics,
      averageScore,
      loading,
      error,
    }),
    [analytics, averageScore, loading, error]
  );
}

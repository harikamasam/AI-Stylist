import { useEffect, useMemo, useState } from "react";
import { fetchProduct } from "../services/api";
import { DEFAULT_PRODUCT } from "../utils/catalog";

export function useProductExtraction(productUrl) {
  const [product, setProduct] = useState(DEFAULT_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productUrl.trim()) {
      setError("");
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchProduct(
          {
            url: productUrl,
          },
          controller.signal
        );

        setProduct({
          ...DEFAULT_PRODUCT,
          ...data,
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("Unable to extract product details");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [productUrl]);

  return useMemo(
    () => ({
      product,
      loading,
      error,
    }),
    [product, loading, error]
  );
}

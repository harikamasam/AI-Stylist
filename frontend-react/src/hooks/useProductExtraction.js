import { useEffect, useMemo, useState } from "react";
import { fetchProduct } from "../services/api";
import { getDefaultProductForCategory } from "../utils/catalog";

export function useProductExtraction(productUrl, category) {
  const fallbackProduct = useMemo(
    () => getDefaultProductForCategory(category),
    [category]
  );
  const [product, setProduct] = useState(fallbackProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setProduct(fallbackProduct);

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
          ...fallbackProduct,
          ...data,
          category,
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("Showing curated preview for selected category.");
          setProduct(fallbackProduct);
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
  }, [category, fallbackProduct, productUrl]);

  return useMemo(
    () => ({
      product,
      loading,
      error,
    }),
    [product, loading, error]
  );
}

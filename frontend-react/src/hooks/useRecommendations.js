import { useEffect, useMemo, useState } from "react";
import { fetchRecommendations } from "../services/api";
import {
  CATEGORY_PRODUCT_IMAGES,
  DEFAULT_PRODUCT_IMAGE,
  FALLBACK_PRODUCTS,
} from "../utils/catalog";

const CATEGORY_META = {
  Shirts: {
    brands: ["Zara Studio", "H&M Premium", "Uniqlo U"],
    prices: ["Rs. 1,999", "Rs. 2,499", "Rs. 1,799"],
  },
  Hoodies: {
    brands: ["Nike Sportswear", "Urbanic", "H&M Divided"],
    prices: ["Rs. 3,499", "Rs. 2,899", "Rs. 2,299"],
  },
  Glasses: {
    brands: ["Lenskart Air", "Ray-Ban", "John Jacobs"],
    prices: ["Rs. 1,499", "Rs. 5,990", "Rs. 3,499"],
  },
  Shoes: {
    brands: ["Nike", "Adidas Originals", "Puma"],
    prices: ["Rs. 7,995", "Rs. 6,599", "Rs. 4,999"],
  },
  Watches: {
    brands: ["Fossil", "Titan Edge", "Casio"],
    prices: ["Rs. 8,995", "Rs. 6,499", "Rs. 4,295"],
  },
};

function formatRecommendation(item, category, index) {
  const categoryImages = CATEGORY_PRODUCT_IMAGES[category] || [];
  const meta = CATEGORY_META[category] || CATEGORY_META.Shirts;

  return {
    title: item.title,
    match: `${item.match}%`,
    tag: item.tag || "Trending",
    brand: meta.brands[index % meta.brands.length],
    price: meta.prices[index % meta.prices.length],
    image:
      item.image ||
      categoryImages[index % categoryImages.length] ||
      DEFAULT_PRODUCT_IMAGE,
  };
}

export function useRecommendations(category, style) {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchRecommendations(
          {
            category,
            style,
          },
          controller.signal
        );

        const recommendedItems = data?.recommended_items || [];

        setProducts(
          recommendedItems.length
            ? recommendedItems.map((item, index) =>
                formatRecommendation(item, category, index)
              )
            : FALLBACK_PRODUCTS
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("Recommendations temporarily unavailable");
          setProducts(FALLBACK_PRODUCTS);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      controller.abort();
    };
  }, [category, style]);

  return useMemo(
    () => ({
      products,
      loading,
      error,
    }),
    [products, loading, error]
  );
}

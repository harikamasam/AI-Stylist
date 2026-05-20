import { useEffect, useMemo, useState } from "react";
import { fetchRecommendations } from "../services/api";
import {
  CATEGORY_PRODUCT_IMAGES,
  DEFAULT_PRODUCT_IMAGE,
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

function getFallbackProducts(category) {
  const images = CATEGORY_PRODUCT_IMAGES[category] || CATEGORY_PRODUCT_IMAGES.Shirts;
  const meta = CATEGORY_META[category] || CATEGORY_META.Shirts;
  const titles = {
    Shirts: ["Tailored Cotton Shirt", "Oxford Resort Shirt", "Relaxed Linen Shirt"],
    Hoodies: ["Oversized Studio Hoodie", "Fleece Street Hoodie", "Minimal Zip Hoodie"],
    Glasses: ["Acetate Frame Glasses", "Classic Round Eyewear", "Soft Square Glasses"],
    Shoes: ["Clean Low-Top Sneakers", "Chunky Street Sneakers", "Minimal Leather Trainers"],
    Watches: ["Silver Minimal Watch", "Black Dial Dress Watch", "Classic Steel Watch"],
  };

  return (titles[category] || titles.Shirts).map((title, index) => ({
    title,
    match: `${92 - index * 3}%`,
    tag: index === 0 ? "Best match" : "Curated",
    brand: meta.brands[index % meta.brands.length],
    price: meta.prices[index % meta.prices.length],
    image: images[index % images.length] || DEFAULT_PRODUCT_IMAGE,
  }));
}

export function useRecommendations(category, style) {
  const [products, setProducts] = useState(() => getFallbackProducts("Shirts"));
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
            : getFallbackProducts(category)
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("");
          setProducts(getFallbackProducts(category));
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

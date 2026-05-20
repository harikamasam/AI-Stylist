export const CATEGORIES = [
  "Shirts",
  "Hoodies",
  "Glasses",
  "Shoes",
  "Watches",
];

export const STYLES = [
  "Casual",
  "Streetwear",
  "Luxury",
  "Minimal",
  "Party",
  "Formal",
];

export const FALLBACK_PRODUCTS = [
  {
    title: "White Oversized Shirt",
    match: "90%",
    tag: "Trending",
    brand: "Zara Studio",
    price: "Rs. 1,999",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
  },
  {
    title: "Black Korean Fit Shirt",
    match: "91%",
    tag: "Trending",
    brand: "Uniqlo U",
    price: "Rs. 2,499",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
];

export const CATEGORY_PRODUCT_IMAGES = {
  Shirts: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=90",
  ],
  Hoodies: [
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=90",
  ],
  Glasses: [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=900&q=90",
  ],
  Shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=90",
  ],
  Watches: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=90",
    "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=90",
  ],
};

export const CATEGORY_DEFAULT_PRODUCTS = {
  Shirts: {
    title: "Tailored Cotton Shirt",
    category: "Shirts",
    price: "Rs. 2,499",
    brand: "AI Stylist Studio",
    image: CATEGORY_PRODUCT_IMAGES.Shirts[0],
  },
  Hoodies: {
    title: "Premium Oversized Hoodie",
    category: "Hoodies",
    price: "Rs. 3,499",
    brand: "Nike Sportswear",
    image: CATEGORY_PRODUCT_IMAGES.Hoodies[0],
  },
  Glasses: {
    title: "Minimal Acetate Eyewear",
    category: "Glasses",
    price: "Rs. 3,499",
    brand: "John Jacobs",
    image: CATEGORY_PRODUCT_IMAGES.Glasses[0],
  },
  Shoes: {
    title: "Clean Low-Top Sneakers",
    category: "Shoes",
    price: "Rs. 6,599",
    brand: "Adidas Originals",
    image: CATEGORY_PRODUCT_IMAGES.Shoes[0],
  },
  Watches: {
    title: "Silver Minimal Watch",
    category: "Watches",
    price: "Rs. 6,499",
    brand: "Titan Edge",
    image: CATEGORY_PRODUCT_IMAGES.Watches[0],
  },
};

export function getDefaultProductForCategory(category = "Shirts") {
  return CATEGORY_DEFAULT_PRODUCTS[category] || CATEGORY_DEFAULT_PRODUCTS.Shirts;
}

export const DEFAULT_PRODUCT = {
  ...CATEGORY_DEFAULT_PRODUCTS.Shirts,
};

export const DEFAULT_PRODUCT_IMAGE =
  CATEGORY_PRODUCT_IMAGES.Shirts[0];

import os
import random

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.outfit_engine import analyze_outfit

load_dotenv()


def get_cors_origins():
    configured_origins = os.getenv("BACKEND_CORS_ORIGINS", "https://aistylist.in")

    if configured_origins == "*":
        return ["*"]

    return [
        origin.strip()
        for origin in configured_origins.split(",")
        if origin.strip()
    ]


cors_origins = get_cors_origins()

app = FastAPI(title="AI Stylist Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=cors_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    category: str
    style: str


class ProductRequest(BaseModel):
    url: str


class OutfitAnalysisRequest(BaseModel):
    category: str
    style: str
    pose: str = "unknown"
    colors: list[str] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/recommend")
def recommend(req: RecommendRequest):
    base = {
        "Shirts": ["White Oversized Shirt", "Black Korean Fit Shirt", "Beige Linen Shirt"],
        "Hoodies": ["Black Oversized Hoodie", "Minimal Grey Hoodie", "Streetwear Graphic Hoodie"],
        "Glasses": ["Round Frame Glasses", "Transparent Frame Glasses", "Luxury Sunglasses"],
        "Shoes": ["White Sneakers", "Chunky Sneakers", "Formal Loafers"],
        "Watches": ["Silver Analog Watch", "Black Smartwatch", "Minimal Leather Watch"],
    }

    colors = {
        "Casual": ["white", "beige", "light blue"],
        "Streetwear": ["black", "grey", "neon"],
        "Luxury": ["black", "gold", "cream"],
        "Minimal": ["white", "black", "beige"],
        "Party": ["black", "maroon", "silver"],
        "Formal": ["navy", "white", "black"],
    }

    items = base.get(req.category, base["Shirts"])

    return {
        "category": req.category,
        "style": req.style,
        "recommended_items": [
            {
                "title": item,
                "match": random.randint(88, 97),
                "tag": "Trending",
                "best_colors": colors.get(req.style, ["black", "white"]),
            }
            for item in items
        ],
    }


@app.post("/analyze")
def analyze(req: RecommendRequest):
    style_lift = {
        "Casual": 2,
        "Streetwear": 4,
        "Luxury": 5,
        "Minimal": 3,
        "Party": 4,
        "Formal": 5,
    }

    category_lift = {
        "Shirts": 4,
        "Hoodies": 3,
        "Glasses": 2,
        "Shoes": 4,
        "Watches": 3,
    }

    lift = style_lift.get(req.style, 2) + category_lift.get(req.category, 2)

    def score(base, spread=8):
        return min(99, max(70, base + lift + random.randint(0, spread)))

    return {
        "fit_accuracy": score(82),
        "pose_tracking": score(85, 7),
        "trend_score": score(80, 9),
        "confidence": score(84, 7),
        "professional_score": score(78, 10),
        "outfit_match_score": score(81, 9),
    }


@app.post("/product")
def product(req: ProductRequest):
    url = req.url.lower()

    if "shirt" in url:
        title = "AI Extracted Shirt"
        price = "Rs. 1999"
        brand = "Fashion AI"
    elif "hoodie" in url:
        title = "AI Extracted Hoodie"
        price = "Rs. 2499"
        brand = "StreetFit"
    else:
        title = "Extracted Fashion Product"
        price = "Rs. 2299"
        brand = "AI Fashion"

    return {
        "title": title,
        "price": price,
        "brand": brand,
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    }


@app.post("/outfit-analysis")
def outfit_analysis(req: OutfitAnalysisRequest):
    return analyze_outfit(
        style=req.style,
        category=req.category,
        pose=req.pose,
        colors=req.colors,
    )

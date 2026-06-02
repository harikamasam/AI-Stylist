import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.assistant_service import generate_analytics_reasoning, generate_assistant_reply
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
    category: str = "Shirts"


class OutfitAnalysisRequest(BaseModel):
    category: str
    style: str
    pose: str = "unknown"
    colors: list[str] = []


class AssistantRequest(BaseModel):
    message: str
    category: str = "Shirts"
    style: str = "Casual"
    colors: list[str] = []
    history: list[dict] = []
    product: dict | None = None
    analytics_verdict: str = ""
    saved_wardrobe_count: int = 0
    try_on_state: str = "idle"
    try_on_metrics: dict = {}


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
    style_seed = sum(ord(char) for char in f"{req.category}:{req.style}")

    return {
        "category": req.category,
        "style": req.style,
        "recommended_items": [
            {
                "title": item,
                "match": max(86, min(98, 90 + ((style_seed + index * 3) % 8))),
                "tag": "Trending",
                "best_colors": colors.get(req.style, ["black", "white"]),
            }
            for index, item in enumerate(items)
        ],
    }


@app.post("/analyze")
def analyze(req: OutfitAnalysisRequest):
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

    outfit_intelligence = analyze_outfit(
        style=req.style,
        category=req.category,
        pose=req.pose,
        colors=req.colors,
    )
    reasoning = outfit_intelligence.get("reasoning", {})
    dynamic_reasoning = generate_analytics_reasoning(
        category=req.category,
        style=req.style,
        colors=req.colors,
        pose=req.pose,
    )
    compatibility = outfit_intelligence.get("compatibility_score", 84)
    confidence = outfit_intelligence.get("confidence", 84)
    professional = outfit_intelligence.get("professional_score", 80)

    def score(base, modifier=0):
        return min(99, max(70, round(base + modifier)))

    return {
        "fit_accuracy": score(confidence, 1 if req.category in ["Shirts", "Hoodies"] else -1),
        "pose_tracking": score(confidence, 3 if req.pose != "unknown" else -4),
        "trend_score": score((compatibility + professional) / 2, 2),
        "confidence": score(confidence),
        "professional_score": score(professional),
        "outfit_match_score": score(compatibility),
        "compatibility_score": compatibility,
        "best_colors": outfit_intelligence.get("best_colors", []),
        "recommendation_reason": outfit_intelligence.get("recommendation_reason"),
        "reasoning": {
            "color_match": reasoning.get(
                "color_match",
                "Neutral contrast keeps the outfit versatile and easy to repeat.",
            ),
            "occasion_fit": reasoning.get(
                "occasion_fit",
                "The selected style works because the pieces match one clear occasion.",
            ),
            "body_fit": reasoning.get(
                "body_fit",
                "The silhouette stays balanced by keeping product scale and body proportions connected.",
            ),
            "style_balance": reasoning.get(
                "style_balance",
                "The outfit feels cohesive when color, texture, and accessories support one styling direction.",
            ),
        },
        "explainable_analysis": dynamic_reasoning,
    }


@app.post("/product")
def product(req: ProductRequest):
    url = req.url.lower()
    category_hint = req.category if req.category else "Shirts"
    source = "generic"

    if "myntra" in url:
        source = "Myntra"
    elif "ajio" in url:
        source = "Ajio"
    elif "amazon" in url:
        source = "Amazon"

    if "shirt" in url:
        title = "AI Extracted Shirt"
        price = "Rs. 1999"
        brand = "Fashion AI"
        category = "Shirts"
        image = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=90"
        colors = ["white", "beige", "charcoal"]
    elif "hoodie" in url:
        title = "AI Extracted Hoodie"
        price = "Rs. 2499"
        brand = "StreetFit"
        category = "Hoodies"
        image = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=90"
        colors = ["grey", "black", "white"]
    elif "shoe" in url or "sneaker" in url:
        title = "AI Extracted Sneakers"
        price = "Rs. 4299"
        brand = "Sole Lab"
        category = "Shoes"
        image = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=90"
        colors = ["white", "black", "red"]
    elif "watch" in url:
        title = "AI Extracted Watch"
        price = "Rs. 6499"
        brand = "Time Studio"
        category = "Watches"
        image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=90"
        colors = ["silver", "black", "white"]
    elif "glass" in url or "eyewear" in url:
        title = "AI Extracted Eyewear"
        price = "Rs. 3499"
        brand = "Frame AI"
        category = "Glasses"
        image = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=90"
        colors = ["black", "clear", "silver"]
    else:
        title = "Extracted Fashion Product"
        price = "Rs. 2299"
        brand = "AI Fashion"
        category = category_hint
        image = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=90"
        colors = ["black", "cream", "grey"]

    processing_profiles = {
        "Shirts": {
            "focus": "upper-body torso overlay",
            "crop": "garment-first crop around collar, shoulder seam, chest, and hem",
            "mask": "soft alpha mask with simulated background cleanup",
            "landmarks": ["left shoulder", "right shoulder", "left hip", "right hip"],
            "overlay": "torso-scale overlay with shoulder rotation, chest width, hem drop, and soft shadow",
        },
        "Hoodies": {
            "focus": "upper-body layer volume",
            "crop": "wide garment crop preserving hood, sleeves, shoulder volume, and ribbed hem",
            "mask": "soft alpha mask with relaxed outer-boundary cleanup",
            "landmarks": ["left shoulder", "right shoulder", "elbows", "hips"],
            "overlay": "oversized torso overlay with volume compensation and opacity blending",
        },
        "Shoes": {
            "focus": "lower-body stance preview",
            "crop": "shoe-focused crop around sole, toe box, and side profile",
            "mask": "background attenuation around footwear silhouette",
            "landmarks": ["ankles", "heels", "foot index points"],
            "overlay": "foot-position preview with stance and shoe-weight indicators",
        },
        "Watches": {
            "focus": "wrist accessory scale",
            "crop": "watch-face crop preserving strap direction and metal tone",
            "mask": "circular watch-face isolation with strap-aware cleanup",
            "landmarks": ["wrists", "elbows"],
            "overlay": "wrist-scale preview with sleeve-gap and metal-tone context",
        },
        "Glasses": {
            "focus": "face alignment preview",
            "crop": "frame-focused crop preserving bridge, lenses, and temple width",
            "mask": "lens/frame isolation with transparent background fallback",
            "landmarks": ["face box", "eye line", "nose bridge"],
            "overlay": "face-frame preview with lens spacing and width matching",
        },
    }
    profile = processing_profiles.get(category, processing_profiles["Shirts"])

    return {
        "title": title,
        "price": price,
        "brand": brand,
        "category": category,
        "image": image,
        "source": source,
        "dominant_colors": colors,
        "garment_pipeline": {
            "image_extracted": True,
            "background_removed": category in ["Shirts", "Hoodies"],
            "overlay_ready": True,
            "method": "product-image isolation fallback with category-aware overlay mask",
            "focus": profile["focus"],
            "crop_strategy": profile["crop"],
            "mask_strategy": profile["mask"],
            "tracked_landmarks": profile["landmarks"],
            "overlay_strategy": profile["overlay"],
            "confidence": 91 if source != "generic" else 84,
            "processing_stages": [
                "Product image extraction",
                "Garment-focused crop",
                "Background cleanup fallback",
                "Category-aware overlay preparation",
            ],
        },
    }


@app.post("/outfit-analysis")
def outfit_analysis(req: OutfitAnalysisRequest):
    return analyze_outfit(
        style=req.style,
        category=req.category,
        pose=req.pose,
        colors=req.colors,
    )


@app.post("/assistant")
def assistant(req: AssistantRequest):
    return generate_assistant_reply(
        message=req.message,
        category=req.category,
        style=req.style,
        colors=req.colors,
        history=req.history,
        product=req.product,
        analytics_verdict=req.analytics_verdict,
        saved_wardrobe_count=req.saved_wardrobe_count,
        try_on_state=req.try_on_state,
        try_on_metrics=req.try_on_metrics,
    )

STYLE_PROFILES = {
    "Formal": {
        "combinations": ["tailored blazer", "crisp shirt", "oxford shoes"],
        "accessories": ["silver watch", "leather belt", "structured bag"],
        "colors": ["navy", "white", "charcoal", "cream"],
        "occasions": ["client meeting", "interview", "office presentation"],
        "professional_weight": 18,
        "casual_weight": -4,
    },
    "Streetwear": {
        "combinations": ["oversized hoodie", "relaxed cargos", "chunky sneakers"],
        "accessories": ["crossbody bag", "cap", "statement chain"],
        "colors": ["black", "grey", "white", "olive"],
        "occasions": ["concert", "campus day", "weekend city walk"],
        "professional_weight": -4,
        "casual_weight": 16,
    },
    "Minimal": {
        "combinations": ["clean overshirt", "straight-fit trousers", "minimal sneakers"],
        "accessories": ["slim watch", "matte belt", "simple tote"],
        "colors": ["black", "white", "beige", "grey"],
        "occasions": ["smart casual day", "gallery visit", "coffee meeting"],
        "professional_weight": 8,
        "casual_weight": 8,
    },
    "Luxury": {
        "combinations": ["premium knit", "tailored trousers", "polished loafers"],
        "accessories": ["gold watch", "leather wallet", "fine chain"],
        "colors": ["black", "cream", "gold", "deep green"],
        "occasions": ["dinner event", "premium lounge", "celebration"],
        "professional_weight": 10,
        "casual_weight": 4,
    },
    "Party": {
        "combinations": ["statement shirt", "slim black trousers", "sleek boots"],
        "accessories": ["metal bracelet", "bold watch", "chain necklace"],
        "colors": ["black", "maroon", "silver", "white"],
        "occasions": ["party night", "club event", "evening social"],
        "professional_weight": -2,
        "casual_weight": 12,
    },
    "Casual": {
        "combinations": ["relaxed shirt", "well-fitted denim", "clean sneakers"],
        "accessories": ["canvas watch", "casual belt", "light backpack"],
        "colors": ["white", "beige", "light blue", "navy"],
        "occasions": ["daily wear", "brunch", "travel day"],
        "professional_weight": 2,
        "casual_weight": 14,
    },
}

CATEGORY_ANCHORS = {
    "Shirts": "layered shirt look",
    "Hoodies": "hoodie-led relaxed silhouette",
    "Glasses": "face-framing accessory focus",
    "Shoes": "footwear-first outfit balance",
    "Watches": "watch-led detail styling",
}

COLOR_COMPATIBILITY = {
    "black": {"white": 10, "grey": 9, "beige": 8, "cream": 8, "maroon": 7},
    "white": {"black": 10, "navy": 9, "grey": 8, "beige": 8, "light blue": 8},
    "grey": {"black": 9, "white": 8, "olive": 7, "navy": 7},
    "beige": {"black": 8, "white": 8, "navy": 8, "cream": 6},
    "navy": {"white": 9, "cream": 9, "beige": 8, "grey": 7},
    "cream": {"navy": 9, "black": 8, "gold": 8, "deep green": 7},
    "maroon": {"black": 7, "white": 7, "silver": 6},
    "gold": {"black": 8, "cream": 8, "deep green": 8},
    "olive": {"white": 7, "grey": 7, "black": 6},
}

POOR_COMBINATIONS = {
    frozenset(("neon", "gold")),
    frozenset(("maroon", "olive")),
    frozenset(("light blue", "gold")),
    frozenset(("beige", "silver")),
}

POSE_SCORE = {
    "upright": 8,
    "confident": 10,
    "relaxed": 4,
    "slouched": -7,
    "unknown": 0,
}


def _normalize(value):
    return value.strip().title() if value else ""


def _normalize_color(value):
    return value.strip().lower() if value else ""


def _score_colors(colors):
    clean_colors = [_normalize_color(color) for color in colors if _normalize_color(color)]

    if len(clean_colors) < 2:
        return 78

    total = 0
    comparisons = 0

    for index, color in enumerate(clean_colors):
        for other in clean_colors[index + 1:]:
            comparisons += 1

            if frozenset((color, other)) in POOR_COMBINATIONS:
                total += 48
                continue

            pair_score = COLOR_COMPATIBILITY.get(color, {}).get(other)

            if pair_score is None:
                pair_score = COLOR_COMPATIBILITY.get(other, {}).get(color)

            total += (pair_score * 10) if pair_score is not None else 65

    if not comparisons:
        return 78

    average = total / comparisons
    return max(45, min(98, round(average)))


def _category_adjustment(category):
    category = _normalize(category)

    return {
        "Shirts": 5,
        "Hoodies": 3,
        "Glasses": 2,
        "Shoes": 4,
        "Watches": 3,
    }.get(category, 2)


def analyze_outfit(style, category, pose="unknown", colors=None):
    normalized_style = _normalize(style) or "Casual"
    normalized_category = _normalize(category) or "Shirts"
    normalized_pose = (pose or "unknown").strip().lower()

    profile = STYLE_PROFILES.get(normalized_style, STYLE_PROFILES["Casual"])
    input_colors = colors or profile["colors"][:3]
    color_score = _score_colors(input_colors)
    pose_lift = POSE_SCORE.get(normalized_pose, POSE_SCORE["unknown"])
    category_lift = _category_adjustment(normalized_category)
    professional_score = max(
        35,
        min(99, 68 + profile["professional_weight"] + category_lift + pose_lift),
    )
    casual_score = max(
        35,
        min(99, 68 + profile["casual_weight"] + category_lift + max(pose_lift, 0) // 2),
    )
    compatibility_score = round(
        color_score * 0.36
        + professional_score * 0.22
        + casual_score * 0.18
        + (82 + category_lift + pose_lift) * 0.24
    )
    compatibility_score = max(50, min(99, compatibility_score))
    confidence = max(60, min(98, compatibility_score + (5 if normalized_pose != "unknown" else -2)))
    category_anchor = CATEGORY_ANCHORS.get(normalized_category, "balanced outfit focus")

    best_colors = []
    for color in profile["colors"] + [_normalize_color(color) for color in input_colors]:
        if color and color not in best_colors:
            best_colors.append(color)

    reason = (
        f"{normalized_style} styling works best here because the {category_anchor} pairs "
        f"with a {best_colors[0]}-led palette and {normalized_pose} posture signal."
    )

    return {
        "style": normalized_style,
        "category": normalized_category,
        "detected_pose": normalized_pose,
        "outfit_suggestions": profile["combinations"],
        "best_colors": best_colors[:5],
        "suggested_accessories": profile["accessories"],
        "occasion_recommendations": profile["occasions"],
        "professional_score": professional_score,
        "casual_score": casual_score,
        "fashion_compatibility_score": compatibility_score,
        "compatibility_score": compatibility_score,
        "confidence": confidence,
        "recommendation_reason": reason,
        "avoid_combinations": [
            "neon with gold",
            "maroon with olive",
            "light blue with gold",
        ],
    }

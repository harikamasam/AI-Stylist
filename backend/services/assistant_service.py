import json
import os
import urllib.error
import urllib.request


GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
REQUEST_TIMEOUT_SECONDS = 12


STYLE_GUIDANCE = {
    "Casual": "relaxed, wearable, balanced, and easy to repeat",
    "Streetwear": "oversized balance, clean sneakers, graphic or utility accents",
    "Luxury": "rich textures, low branding, polished accessories, and controlled colors",
    "Minimal": "monochrome neutrals, clean lines, and precise fit",
    "Party": "evening contrast, one statement detail, and sharper accessories",
    "Formal": "structured layers, crisp shirts, polished shoes, and subdued colors",
}

CATEGORY_GUIDANCE = {
    "Shirts": "focus on shoulder fit, collar shape, sleeve length, and tuck/hem balance",
    "Hoodies": "control volume with slimmer bottoms or structured shoes",
    "Glasses": "match frame width to face width and repeat frame color in the outfit",
    "Shoes": "match shoe weight to the outfit silhouette",
    "Watches": "match the metal tone to belt, buckle, rings, or eyewear details",
}


def _compact(value, fallback=""):
    if isinstance(value, str) and value.strip():
        return value.strip()
    return fallback


def build_system_instruction():
    return """
You are Aura Stylist, a premium AI fashion stylist inside AI Stylist.
You sound modern, confident, concise, and helpful.
You are not robotic, not overly long, and never mention internal implementation details.
Every answer should feel like practical fashion guidance from a real stylist.
When useful, explain why the recommendation works through silhouette, color harmony, occasion fit, and styling balance.
""".strip()


def build_contextual_prompt(
    message,
    category,
    style,
    colors=None,
    history=None,
    product=None,
    analytics_verdict="",
    saved_wardrobe_count=0,
    try_on_state="idle",
    try_on_metrics=None,
):
    selected_style = _compact(style, "Casual")
    selected_category = _compact(category, "Shirts")
    detected_colors = ", ".join(colors or []) if colors else "not detected"
    selected_product = product or {}
    product_title = _compact(selected_product.get("title"), "No product selected")
    product_brand = _compact(selected_product.get("brand"), "unknown brand")
    product_price = _compact(selected_product.get("price"), "unknown price")
    metrics = try_on_metrics or {}
    metric_summary = (
        f"{metrics.get('confidence')}% confidence, {metrics.get('alignment')} alignment, "
        f"shoulder {metrics.get('shoulder')}, chest {metrics.get('chest')}, body scale {metrics.get('bodyScale')}"
        if metrics.get("landmarksDetected")
        else "not detected yet"
    )
    recent_history = "\n".join(
        f"{item.get('role', 'user')}: {item.get('text', '')}"
        for item in (history or [])[-6:]
        if item.get("text")
    )

    return f"""
User question:
{message}

Current styling context:
- Selected category: {selected_category}
- Selected style: {selected_style}
- Detected colors: {detected_colors}
- Product preview: {product_title} by {product_brand}, {product_price}
- Analytics verdict: {_compact(analytics_verdict, "not available yet")}
- Saved wardrobe items: {saved_wardrobe_count}
- Try-on state: {_compact(try_on_state, "idle")}
- Try-on CV metrics: {metric_summary}
- Category guidance: {CATEGORY_GUIDANCE.get(selected_category, CATEGORY_GUIDANCE["Shirts"])}
- Style direction: {STYLE_GUIDANCE.get(selected_style, STYLE_GUIDANCE["Casual"])}
- Recent conversation:
{recent_history or "No previous context."}

Response rules:
- 4 to 7 short sentences maximum.
- Explain why the recommendation works.
- Mention color combinations, occasion fit, and styling balance when relevant.
- If the user asks for an interview, placement, college, wedding, summer, streetwear, formal, sneakers, black jeans, or dark jeans look, answer directly.
- Do not mention that you are an API or language model.
""".strip()


def _extract_gemini_text(payload):
    candidates = payload.get("candidates") or []
    if not candidates:
        return ""

    parts = candidates[0].get("content", {}).get("parts") or []
    text_parts = [part.get("text", "").strip() for part in parts if part.get("text")]
    return "\n".join(part for part in text_parts if part).strip()


def _call_gemini_prompt(prompt, max_tokens=360, temperature=0.45):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    model = os.getenv("GEMINI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    url = GEMINI_ENDPOINT.format(model=model)
    body = {
        "system_instruction": {
            "parts": [{"text": build_system_instruction()}],
        },
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "topP": 0.9,
            "maxOutputTokens": max_tokens,
        },
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=6) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
        return None

    return _extract_gemini_text(data) or None


def call_gemini(
    message,
    category,
    style,
    colors=None,
    history=None,
    product=None,
    analytics_verdict="",
    saved_wardrobe_count=0,
    try_on_state="idle",
    try_on_metrics=None,
):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None

    prompt = build_contextual_prompt(
        message,
        category,
        style,
        colors,
        history,
        product,
        analytics_verdict,
        saved_wardrobe_count,
        try_on_state,
        try_on_metrics,
    )
    return _call_gemini_prompt(prompt, max_tokens=220, temperature=0.7)


def generate_analytics_reasoning(category, style, colors=None, pose="unknown", product=None):
    palette = ", ".join(colors or []) if colors else "not detected"
    product_title = _compact((product or {}).get("title"), "current product")
    prompt = f"""
Generate explainable fashion analytics for AI Stylist.

Context:
- Product: {product_title}
- Category: {category}
- Style: {style}
- Colors: {palette}
- Pose: {pose}

Return strict JSON only with this shape:
{{
  "color_harmony": {{"verdict": "Excellent|Strong|Moderate", "score": 0, "reason": "..."}},
  "occasion_analysis": [
    {{"label": "Interview Fit", "verdict": "...", "score": 0, "reason": "..."}},
    {{"label": "Business Casual Fit", "verdict": "...", "score": 0, "reason": "..."}},
    {{"label": "Wedding/Event Fit", "verdict": "...", "score": 0, "reason": "..."}},
    {{"label": "Party Fit", "verdict": "...", "score": 0, "reason": "..."}}
  ],
  "body_balance": {{"verdict": "Excellent|Strong|Moderate", "score": 0, "reason": "..."}},
  "style_consistency": {{"verdict": "Excellent|Strong|Moderate", "score": 0, "reason": "..."}}
}}
Keep each reason one sentence and never use placeholder text.
""".strip()

    text = _call_gemini_prompt(prompt, max_tokens=460, temperature=0.35)
    if not text:
        return None

    try:
        return json.loads(text.strip().removeprefix("```json").removeprefix("```").removesuffix("```"))
    except json.JSONDecodeError:
        return None


def fallback_assistant_reply(
    message,
    category,
    style,
    colors=None,
    product=None,
    analytics_verdict="",
    saved_wardrobe_count=0,
    try_on_state="idle",
    try_on_metrics=None,
):
    text = message.lower()
    selected_style = _compact(style, "Casual")
    selected_category = _compact(category, "Shirts")
    product_title = _compact((product or {}).get("title"), "")
    context = (
        f"You selected {product_title} in {selected_category} with a {selected_style} style, "
        if product_title
        else f"You selected {selected_category} with a {selected_style} style, "
    )
    palette = ", ".join(colors or ["black", "cream", "grey", "silver"])
    metrics = try_on_metrics or {}
    fit_sentence = (
        f" The mirror is reading {metrics.get('confidence')}% fit confidence with {metrics.get('alignment')} shoulder alignment, so keep shoulder seams and torso volume controlled."
        if metrics.get("landmarksDetected")
        else ""
    )

    if "interview" in text or "placement" in text or "microsoft" in text:
        return (
            f"For a {selected_style.lower()} interview look, start with a crisp white or light blue shirt, "
            "navy or charcoal trousers, clean dark shoes, and a silver watch. This works because the palette is calm, "
            f"structured, and recruiter-safe while still looking intentional.{fit_sentence} Avoid loud logos; let fit, grooming, and polish carry the outfit."
        )

    if "black jeans" in text or "dark jeans" in text:
        return (
            "Black jeans are most versatile with white, grey, navy, olive, or beige. For a clean outfit, pair them with a white shirt and minimal sneakers; "
            "for streetwear, use an oversized hoodie and chunkier shoes. The key is contrast: black jeans ground the look, so keep the top lighter or textured."
        )

    if "wedding" in text or "event" in text:
        return (
            "For a summer wedding or event, choose breathable fabric, a cream or pastel shirt, tailored trousers, and loafers. "
            "Add a silver or muted-gold watch so it feels dressed up without becoming flashy. This balance works because the outfit respects the occasion while staying comfortable."
        )

    if "summer" in text:
        return (
            "For summer, go lighter in both fabric and color: cotton or linen, white, cream, light blue, beige, and low-profile sneakers. "
            f"Since you selected {selected_category}, keep the fit breathable and avoid heavy layering. The look will feel cleaner and more premium in warm weather."
        )

    if "white sneaker" in text or "sneaker" in text:
        return (
            "White sneakers work with almost everything, but they look best when the outfit has one other clean/light element. "
            "Try black jeans with a white shirt, beige overshirt, or grey hoodie. This repeats the sneaker color and makes the outfit feel styled rather than accidental."
        )

    if "streetwear" in text:
        return (
            "For streetwear, balance volume: oversized hoodie or shirt on top, relaxed cargos or straight denim, and chunky sneakers. "
            "Use black, grey, cream, or olive as the base and add only one accent color. The restraint keeps the outfit modern instead of messy."
        )

    if "minimal" in text or "college" in text:
        return (
            "A minimalist college outfit can be a neutral shirt or hoodie, straight-fit jeans, clean sneakers, and a simple watch. "
            "Black, white, grey, cream, and navy are easiest to repeat. It works because the silhouette stays comfortable while the colors feel intentional."
        )

    if "color" in text or "match" in text:
        return (
            f"For your current {selected_style.lower()} direction, use {palette} as the base palette. "
            f"Pick one dominant neutral, one supporting color, and one accessory tone.{fit_sentence} This keeps the outfit cohesive and makes the product easier to style across occasions."
        )

    return (
        f"{context}so I would prioritize {STYLE_GUIDANCE.get(selected_style, STYLE_GUIDANCE['Casual'])}. "
        f"For this category, {CATEGORY_GUIDANCE.get(selected_category, CATEGORY_GUIDANCE['Shirts'])}. "
        f"Keep the palette tight, match the outfit to one clear occasion, and use one premium accessory to finish the look.{fit_sentence}"
    )


def generate_assistant_reply(
    message,
    category,
    style,
    colors=None,
    history=None,
    product=None,
    analytics_verdict="",
    saved_wardrobe_count=0,
    try_on_state="idle",
    try_on_metrics=None,
):
    gemini_reply = call_gemini(
        message,
        category,
        style,
        colors,
        history,
        product,
        analytics_verdict,
        saved_wardrobe_count,
        try_on_state,
        try_on_metrics,
    )
    if gemini_reply:
        return {"reply": gemini_reply, "source": "gemini"}

    return {
        "reply": fallback_assistant_reply(
            message,
            category,
            style,
            colors,
            product,
            analytics_verdict,
            saved_wardrobe_count,
            try_on_state,
            try_on_metrics,
        ),
        "source": "fallback",
    }

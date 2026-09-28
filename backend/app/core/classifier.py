"""
Auto-classification service for civic issues.
Uses Google Gemini (generativeai) for image-based category detection
and GPS proximity for ward determination.
"""
import math
import os
import json
import logging

logger = logging.getLogger(__name__)

# ─── Ward Centroid Data (for GPS-to-ward mapping) ───────────────────────────
# These centroids match the seed wards in core/store.py.
# In production, these would come from the DB with boundary_geojson polygons.
WARD_CENTROIDS = {
    "w_12": {"name": "Ward 12 - Bandra West", "lat": 19.0596, "lon": 72.8295},
    "w_14": {"name": "Ward 14 - Andheri East", "lat": 19.1136, "lon": 72.8697},
    "w_7":  {"name": "Ward 7 - Dadar Central", "lat": 19.0178, "lon": 72.8478},
    "w_9":  {"name": "Ward 9 - Colaba Waterfront", "lat": 18.9067, "lon": 72.8147},
    "w_18": {"name": "Ward 18 - Powai Hills", "lat": 19.1176, "lon": 72.9060},
}

# ─── Category Keywords (rule-based fallback) ────────────────────────────────
CATEGORY_KEYWORDS = {
    "cat_pothole": ["pothole", "road damage", "crater", "road cavity", "broken road", "road crack", "road hole"],
    "cat_footpath": ["footpath", "sidewalk", "pedestrian path", "broken pavement", "damaged walkway"],
    "cat_waterleak": ["water leak", "pipeline", "pipe burst", "water main", "water leaking", "broken pipe"],
    "cat_contaminated": ["dirty water", "contaminated", "unsafe water", "brown water", "water quality"],
    "cat_garbage": ["garbage", "trash", "waste", "dumpster", "rubbish", "litter", "dump"],
    "cat_streetlight": ["streetlight", "street light", "lamp post", "light not working", "dark street", "broken light"],
    "cat_mosquito": ["mosquito", "dengue", "stagnant water", "breeding", "malaria", "insect"],
}

# Map category → department
CATEGORY_DEPARTMENT_MAP = {
    "cat_pothole": "dept_roads",
    "cat_footpath": "dept_roads",
    "cat_waterleak": "dept_water",
    "cat_contaminated": "dept_water",
    "cat_garbage": "dept_waste",
    "cat_streetlight": "dept_power",
    "cat_mosquito": "dept_health",
}


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the Haversine distance in km between two GPS points."""
    R = 6371.0  # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def determine_ward_by_gps(latitude: float, longitude: float, wards: list | None = None) -> tuple[str | None, str] | None:
    """
    Determine the nearest ward based on GPS coordinates.
    Uses Haversine distance to find the closest ward centroid.
    
    Args:
        latitude: GPS latitude
        longitude: GPS longitude
        wards: Optional list of ward dicts from the store (uses default centroids if None)
    
    Returns:
        Tuple of (ward_id, ward_name) or (None, None) if no match.
    """
    centroids = WARD_CENTROIDS
    
    # If dynamic ward data is provided, build centroids from it
    if wards:
        centroids = {}
        for w in wards:
            wid = w.get("id") or w.get("ward_id")
            wname = w.get("name", "")
            clat = w.get("center_latitude") or w.get("centerLatitude")
            clon = w.get("center_longitude") or w.get("centerLongitude")
            if clat and clon:
                centroids[wid] = {"name": wname, "lat": float(clat), "lon": float(clon)}
        if not centroids:
            centroids = WARD_CENTROIDS

    best_id = None
    best_name = None
    best_distance = float("inf")

    for ward_id, info in centroids.items():
        dist = _haversine_distance(latitude, longitude, info["lat"], info["lon"])
        if dist < best_distance:
            best_distance = dist
            best_id = ward_id
            best_name = info["name"]

    # Only match if within 15km (reasonable city ward radius)
    if best_distance > 15.0:
        return None, None

    return best_id, best_name


def classify_category_by_text(title: str, description: str) -> tuple[str | None, str | None, float]:
    """
    Rule-based category classification using keyword matching on title/description.
    
    Returns:
        Tuple of (category_id, department_id, confidence)
    """
    text = f"{title} {description}".lower()
    best_cat = None
    best_score = 0

    for cat_id, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > best_score:
            best_score = score
            best_cat = cat_id

    if best_cat and best_score > 0:
        confidence = min(best_score / 3.0, 1.0)  # Normalize to 0-1
        return best_cat, CATEGORY_DEPARTMENT_MAP.get(best_cat), confidence

    return None, None, 0.0


async def classify_category_by_image(image_urls: list, title: str = "", description: str = "") -> tuple[str | None, str | None, float]:
    """
    Use Google Gemini to classify the civic issue category from images.
    Falls back to text-based classification if Gemini is unavailable.
    
    Args:
        image_urls: List of image URLs to analyze
        title: Issue title for context
        description: Issue description for context
    
    Returns:
        Tuple of (category_id, department_id, confidence)
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    
    if not api_key or not image_urls:
        # Fall back to text classification
        return classify_category_by_text(title, description)

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)

        model = genai.GenerativeModel("gemini-2.0-flash")

        # Build the prompt with available categories
        categories_desc = "\n".join([
            f"- {cat_id}: {', '.join(kws)}" for cat_id, kws in CATEGORY_KEYWORDS.items()
        ])

        prompt = f"""You are a civic issue classification system for a municipal corporation.
Analyze the provided image(s) and context to determine the most appropriate issue category.

Available categories:
{categories_desc}

Issue title: {title}
Issue description: {description}

Respond with ONLY a JSON object containing:
- "category_id": one of the category IDs listed above
- "confidence": a float between 0.0 and 1.0 indicating your confidence
- "reasoning": a brief explanation (1 sentence)

Example: {{"category_id": "cat_pothole", "confidence": 0.92, "reasoning": "Image shows a large road cavity with exposed gravel"}}
"""
        # For now, use text-based analysis with image URLs as context
        full_prompt = f"{prompt}\n\nImage URLs for reference: {', '.join(image_urls)}"
        response = model.generate_content(full_prompt)

        # Parse the JSON response
        response_text = response.text.strip()
        # Handle markdown code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        result = json.loads(response_text)
        cat_id = result.get("category_id")
        confidence = float(result.get("confidence", 0.5))

        if cat_id in CATEGORY_DEPARTMENT_MAP:
            return cat_id, CATEGORY_DEPARTMENT_MAP[cat_id], confidence
        else:
            logger.warning(f"Gemini returned unknown category: {cat_id}")
            return classify_category_by_text(title, description)

    except Exception as e:
        logger.warning(f"Gemini classification failed: {e}. Falling back to text-based.")
        return classify_category_by_text(title, description)


def auto_classify_issue(
    title: str,
    description: str,
    image_urls: list | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    wards: list | None = None,
) -> dict:
    """
    Synchronous entry point for auto-classification of issues.
    Determines category (from text/images) and ward (from GPS).
    
    Returns a dict with keys:
        - category_id: str | None
        - department_id: str | None
        - ward_id: str | None
        - ward_name: str | None
        - confidence: float
        - auto_classified: bool
    """
    result = {
        "category_id": None,
        "department_id": None,
        "ward_id": None,
        "ward_name": None,
        "confidence": 0.0,
        "auto_classified": False,
    }

    # 1. Classify category from text (synchronous fallback)
    cat_id, dept_id, confidence = classify_category_by_text(title, description)
    if cat_id:
        result["category_id"] = cat_id
        result["department_id"] = dept_id
        result["confidence"] = confidence
        result["auto_classified"] = True

    # 2. Determine ward from GPS
    if latitude is not None and longitude is not None:
        ward_id, ward_name = determine_ward_by_gps(latitude, longitude, wards)
        if ward_id:
            result["ward_id"] = ward_id
            result["ward_name"] = ward_name
            result["auto_classified"] = True

    return result

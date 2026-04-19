from flask import Blueprint, jsonify, request

recommendation_bp = Blueprint("recommendation_bp", __name__)


@recommendation_bp.post("/recommend")
def recommend_crop():
    payload = request.json or {}
    month = (payload.get("month") or "").lower()
    soil_type = (payload.get("soil_type") or "").lower()
    temperature = float(payload.get("temperature", 0))
    
    rainfall_val = payload.get("rainfall")
    rainfall = float(rainfall_val) if rainfall_val is not None else None

    crop = "Maize"
    reason = f"Maintained stable default recommendation for {soil_type.title()} soil in {month.title()}."

    if soil_type == "alluvial" and month in {"november", "december", "january"} and 10 <= temperature <= 25:
        crop = "Wheat"
        reason = "Cool season with alluvial soil is perfectly suitable for high-yield wheat."
    elif soil_type in {"black", "regur"} and month in {"june", "july", "august"} and 22 <= temperature <= 34:
        crop = "Cotton"
        reason = "Black soil and warm monsoon months provide the optimal foundation for cotton cultivation."
    elif soil_type in {"clayey", "loamy", "clay"} and month in {"june", "july", "august", "september", "jun", "jul", "aug", "sep"} and 24 <= temperature <= 35:
        crop = "Rice"
        reason = "Rice performs exceptionally well in moist loamy/clayey conditions during monsoon months."
    elif soil_type in {"sandy", "sandy loam"} and 24 <= temperature <= 38:
        crop = "Groundnut"
        reason = "Sandy soils with warmer conditions are heavily favorable for groundnut growth."

    if rainfall is not None:
        if crop == "Rice" and rainfall < 100:
            reason += f" Note: Rainfall is only {rainfall}mm, ensure heavy secondary irrigation."
        elif rainfall > 150:
            reason += f" Abundant rainfall ({rainfall}mm) heavily supports this crop cycle."
        else:
            reason += f" Expected rainfall ({rainfall}mm) is adequate for optimal growth."

    return jsonify(
        {
            "month": month,
            "temperature": temperature,
            "soil_type": soil_type,
            "recommended_crop": crop,
            "reason": reason,
        }
    )

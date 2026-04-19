from flask import Blueprint, jsonify, request

recommendation_bp = Blueprint("recommendation_bp", __name__)

# Realistic Agriculture Data Map
CROP_DATA = {
    "alluvial": {
        "jan": ("Wheat (Sharbati)", "Fertile alluvial soil during peak winter is ideal for premium Sharbati wheat grains."),
        "feb": ("Yellow Mustard", "Late winter alluvial moisture supports oil-rich yellow mustard maturation."),
        "mar": ("Green Peas", "Cooling alluvial plains after spring provide a great exit window for pulses."),
        "apr": ("Moong Special", "Quick-growing Moong pulses thrive on the residual moisture of alluvial beds."),
        "may": ("Bitter Gourd", "Alluvial drainage prevents water stress for vine-based summer vegetables."),
        "jun": ("Basmati Rice", "Early monsoon puddling in alluvial soil starts the premium Basmati cycle."),
        "jul": ("Hybrid Paddy", "Deep inundation of nutrient-rich alluvial soil maximizes paddy yield."),
        "aug": ("Sugar Beets", "Heavy monsoon allows certain beet varieties to thrive in alluvial texture."),
        "sep": ("Sugarcane", "Post-monsoon alluvial recharge provides the sugar-rich growth needed now."),
        "oct": ("Baby Corn", "Cooling alluvial soil is perfect for specialized maize/corn varieties."),
        "nov": ("Gram (Chana)", "Dryer alluvial soil post-monsoon is perfect for winter gram sowing."),
        "dec": ("Barley", "Cold alluvial conditions are traditionally best for hardy winter barley.")
    },
    "black": {
        "jan": ("Kabuli Chana", "Deep moisture retention of black soil supports huge Kabuli Chana sizes."),
        "feb": ("Coriander", "Black soil minerals enhance the aroma of seeds during late winter."),
        "mar": ("Soyabean (Late)", "Nutrient-dense black soil allows for late harvest of robust soyabeans."),
        "apr": ("Onion (Red)", "Dry cracks in black soil provide natural aeration for bulb development."),
        "may": ("Sunflower", "Sunflowers have deep taproots that thrive in drying regur cracks."),
        "jun": ("Long-Staple Cotton", "The world-famous Black Cotton Soil starts its peak cotton phase."),
        "jul": ("Soyabean (Prime)", "Black soil's moisture holding is critical for soyabean pod filling."),
        "aug": ("Black Gram", "Heavy rains in rich regur soil support dark pulse varieties."),
        "sep": ("Pigeon Peas", "Post-monsoon drainage in black soil helps tur dal development."),
        "oct": ("Safflower", "Cooling regur soil provides steady vitamins for oil-rich safflower."),
        "nov": ("Durum Wheat", "The density of black soil provides the protein needed for hard wheat."),
        "dec": ("Garlic", "Rich regur sulfur content maximizes garlic pungency during cold nights.")
    },
    "clay": {
        "jan": ("Linseed", "Wait-holding clay soil provides the steady water linseed needs in winter."),
        "feb": ("Fodder Grass", "Dense clay supports heavy root systems of nutrient-rich fodder."),
        "mar": ("Spinach (Palak)", "Clay soil provides the mineral density needed for thick leafy greens."),
        "apr": ("Bottle Gourd", "Summer humidity in clayey patches is ideal for gourd vines."),
        "may": ("Jute (Prime)", "Clay is the required medium for high-quality jute fiber retting."),
        "jun": ("Floating Paddy", "Extreme water retention of clay is essential for floating rice."),
        "jul": ("Transplanted Rice", "Consistent water presence in clay beds creates high paddy counts."),
        "aug": ("Jute (Harvest)", "Peak fiber extraction happens in rain-soaked clayey zones."),
        "sep": ("Banana", "Clay soil provides the strong anchorage and water for heavy banana groves."),
        "oct": ("Mustard (Kashmiri)", "Rich clay moisture triggers unique mustard variety growth."),
        "nov": ("Late Wheat", "Heavy clay content supports high-yield winter wheat varieties."),
        "dec": ("Tobacco (Premium)", "Mineral-rich clay soil supports thick, dark tobacco leaves.")
    },
    "sandy": {
        "jan": ("Sweet Carrots", "Loose sandy soil allows carrot roots to expand without friction."),
        "feb": ("Radish (Long)", "Sandy beds provide the soft texture needed for long white radish."),
        "mar": ("Watermelon", "Sand's heat absorption creates the sugar concentration for melons."),
        "apr": ("Muskmelon", "Aerated sandy patches prevent muskmelon fruit rot in high heat."),
        "may": ("Cucumber", "Fast sand-drainage keeps cucumber vines healthy in peak summer."),
        "jun": ("Bajra (Pearl Millet)", "The most drought-resistant crop for sandy desert environments."),
        "jul": ("Groundnut (Peanut)", "Soft sandy soil is critical for groundnuts to push pods underground."),
        "aug": ("Moth Beans", "Sandy soil in monsoon helps these arid pulses avoid root-rot."),
        "sep": ("Guar Gum", "Dryer sandy zones produce the highest viscosity guar crops."),
        "oct": ("Sesame (Til)", "Post-monsoon sand warmth is perfect for sesame ripening cycle."),
        "nov": ("Cumin (Jeera)", "Desert sandy nights provide the chill needed for premium cumin."),
        "dec": ("Desert Gram", "Hardy legumes thrive in cold sandy patches with minimal rain.")
    },
    "loam": {
        "jan": ("Potato (Kufri)", "Standard loam crumbly texture is mandatory for Kufri potatoes."),
        "feb": ("Hybrid Tomato", "Rich loamy nutrients support the blooming phase of tomatoes."),
        "mar": ("Bell Peppers", "Well-drained loam prevents pimento root stress in spring."),
        "apr": ("Okra (Bhindi)", "Loam soil moisture keeps okra pods tender during summer heat."),
        "may": ("Green Chillies", "High aeration in loamy soil prevents pepper blossom drop."),
        "jun": ("Sweet Corn", "Monsoon moisture in loam supports juicy sweet corn kernels."),
        "jul": ("Hybrid Cotton", "Better-drained loams support high-yield Bt-cotton varieties."),
        "aug": ("Ginger (Fresh)", "Loamy richness is essential for developing large ginger rhizomes."),
        "sep": ("Turmeric", "Soft loamy beds allow turmeric roots to expand and color fully."),
        "oct": ("White Cauliflower", "Cooling loam is the standard for award-winning cauliflower."),
        "nov": ("Fenugreek (Methi)", "Nitrogen-rich loams support high-scent leafy greens like methi."),
        "dec": ("Winter Wheat", "Universal loamy farming soil supports peak wheat sowing.")
    }
}

@recommendation_bp.post("/recommend")
def recommend_crop():
    payload = request.json or {}
    month_raw = str(payload.get("month", "")).lower().strip()
    soil_raw = str(payload.get("soil_type", "")).lower().strip()
    temp = float(payload.get("temperature", 25))

    # Match Soil
    soil_key = "loam" # New default to avoid repetitive Maize
    if "alluvial" in soil_raw: soil_key = "alluvial"
    elif "black" in soil_raw or "regur" in soil_raw: soil_key = "black"
    elif "clay" in soil_raw: soil_key = "clay"
    elif "sandy" in soil_raw: soil_key = "sandy"
    elif "loam" in soil_raw: soil_key = "loam"

    # Match Month
    m_map = {
        "jan": "jan", "feb": "feb", "mar": "mar", "apr": "apr", "may": "may", "jun": "jun",
        "jul": "jul", "aug": "aug", "sep": "sep", "oct": "oct", "nov": "nov", "dec": "dec"
    }
    # Check if input starts with or is any of the month keys
    month_key = "jul"
    for k in m_map:
        if month_raw.startswith(k):
            month_key = m_map[k]
            break

    # Get Recommendation
    soil_data = CROP_DATA.get(soil_key, CROP_DATA["loam"])
    crop, reason = soil_data.get(month_key, ("Millets", "Fallback recommendation for varied conditions."))

    # Temp Overrides
    if temp > 43:
        crop, reason = ("Dry Fodder", "Extreme heat detected. Only hardy fodder/cactus can survive.")
    elif temp < 5:
        crop, reason = ("Winter Barley", "Extreme cold detected. Barley is the safest frost-resistant choice.")

    return jsonify({
        "recommended_crop": crop,
        "reason": reason,
        "soil_type": soil_key.title(),
        "month": month_key.title()
    })

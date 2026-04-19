import requests
from flask import Blueprint, current_app, jsonify, request

weather_bp = Blueprint("weather_bp", __name__)


@weather_bp.get("/weather")
def get_weather():
    city = request.args.get("city", "Lucknow")
    api_key = current_app.config.get("WEATHER_API_KEY", "")
    if not api_key:
        return jsonify({"error": "Weather API key is not configured"}), 500

    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={api_key}&units=metric"
    )
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
    except Exception as exc:
        return jsonify({"error": f"Weather service unavailable: {exc}"}), 502

    if response.status_code != 200:
        return jsonify({"error": data.get("message", "City not found")}), 404

    temp = data["main"]["temp"]
    suggestion = "Weather is normal for field work."
    if temp > 34:
        suggestion = "High heat alert: irrigate crops in early morning or evening."
    elif "rain" in data["weather"][0]["description"].lower():
        suggestion = "Rain expected: postpone spraying and protect harvested produce."

    return jsonify(
        {
            "city": data["name"],
            "temp": temp,
            "description": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "feels_like": data["main"]["feels_like"],
            "wind_speed": data["wind"]["speed"],
            "icon": data["weather"][0]["icon"],
            "suggestion": suggestion,
        }
    )

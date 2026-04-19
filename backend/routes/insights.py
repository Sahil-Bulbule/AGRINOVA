import json
import os

from flask import Blueprint, current_app, jsonify, request

insights_bp = Blueprint("insights_bp", __name__)


def calculate_insights(monthly_points):
    if not monthly_points:
        return {
            "trend": "no-data",
            "change": "0%",
            "highest_month": "N/A",
            "lowest_month": "N/A",
        }

    first = monthly_points[0]["price"]
    last = monthly_points[-1]["price"]
    delta_pct = ((last - first) / first) * 100 if first else 0.0
    trend = "increasing" if delta_pct >= 0 else "decreasing"
    highest = max(monthly_points, key=lambda row: row["price"])
    lowest = min(monthly_points, key=lambda row: row["price"])

    return {
        "trend": trend,
        "change": f"{delta_pct:+.2f}%",
        "highest_month": highest["month"],
        "lowest_month": lowest["month"],
    }


@insights_bp.get("/insights")
def get_insights():
    state = request.args.get("state", "")
    city = request.args.get("city", "")
    crop = request.args.get("crop", "")

    data_file = os.path.join(current_app.config["DATA_DIR"], "trends_data.json")
    with open(data_file, "r", encoding="utf-8") as file:
        rows = json.load(file)

    filtered = [
        row for row in rows
        if row["state"].lower() == state.lower()
        and row["city"].lower() == city.lower()
        and row["crop"].lower() == crop.lower()
    ]
    return jsonify(calculate_insights(filtered))

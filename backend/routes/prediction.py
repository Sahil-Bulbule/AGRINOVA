import json
import os

from flask import Blueprint, current_app, jsonify, request

prediction_bp = Blueprint("prediction_bp", __name__)


def moving_average(prices, window=3):
    if not prices:
        return 0.0
    if len(prices) < window:
        return round(sum(prices) / len(prices), 2)
    selected = prices[-window:]
    return round(sum(selected) / window, 2)


@prediction_bp.get("/price-prediction")
def get_price_prediction():
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
    prices = [row["price"] for row in filtered]
    return jsonify({"next_month_price": moving_average(prices)})

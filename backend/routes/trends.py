import json
import os
from flask import Blueprint, current_app, jsonify, request

trends_bp = Blueprint("trends_bp", __name__)


def _load_trends_data():
    data_file = os.path.join(current_app.config["DATA_DIR"], "trends_data.json")
    with open(data_file, "r", encoding="utf-8") as file:
        return json.load(file)


@trends_bp.get("/live-trends")
def get_live_trends():
    """
    Returns state-level trends snapshot.
    GET /live-trends?state=Maharashtra

    - If no state is passed  → 400 with list of all available states.
    - If state is not found in data → 200 with success=false message.
    - Otherwise → 200 with trends crop data.
    """
    state = request.args.get("state", "").strip()

    # Guard: state param must be provided
    if not state:
        all_states = _load_trends_data()
        return jsonify(
            {
                "success": False,
                "message": "Pass a state name in query, e.g. /live-trends?state=Maharashtra",
                "available_states": [item["state"] for item in all_states],
            }
        ), 400

    # Lookup state (case-insensitive) in JSON data
    all_states = _load_trends_data()
    match = next(
        (item for item in all_states if item["state"].lower() == state.lower()), None
    )

    if not match:
        return jsonify(
            {
                "success": False,
                "message": f"No trends data found for '{state}'. Please check the spelling.",
            }
        )

    return jsonify(match)


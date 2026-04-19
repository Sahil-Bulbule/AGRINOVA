import json
import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from routes.insights import insights_bp
from routes.trends import trends_bp
from routes.prediction import prediction_bp
from routes.recommendation import recommendation_bp
from routes.weather import weather_bp


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["DATA_DIR"] = DATA_DIR
    app.config["WEATHER_API_KEY"] = "f50bcbff40f242fab19370018171af51"

    app.register_blueprint(weather_bp)
    app.register_blueprint(trends_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(insights_bp)
    app.register_blueprint(recommendation_bp)

    @app.get("/schemes")
    def get_schemes():
        category = request.args.get("category")
        with open(os.path.join(DATA_DIR, "schemes.json"), "r", encoding="utf-8") as file:
            data = json.load(file)
        if category:
            return jsonify(data.get(category, []))
        return jsonify(data)

    @app.get("/trends")
    def get_trends():
        year  = request.args.get('year', '2026')
        month = request.args.get('month', '')

        with open(os.path.join(DATA_DIR, "trends.json"), "r", encoding="utf-8") as f:
            all_data = json.load(f)

        # fallback to 2026 if unknown year
        data = all_data.get(year, all_data.get('2026', {}))

        # deep copy so we don't mutate the loaded dict
        import copy
        data = copy.deepcopy(data)

        # If a specific month is requested, filter to just that month
        if month and month in data.get('labels', []):
            idx = data['labels'].index(month)
            data['labels'] = [month]
            for ds in data['datasets']:
                ds['data'] = [ds['data'][idx]]

        return jsonify(data)

    @app.route("/")
def home():
    return "Backend LIVE hai 🚀"

    @app.post("/feedback")
    def save_feedback():
        data = request.json or {}
        name = data.get('name')
        email = data.get('email')
        rating = data.get('rating', 5)
        message = data.get('message')

        # Save to File (for easy viewing)
        log_path = os.path.join(BASE_DIR, "feedbacks.txt")
        from datetime import datetime
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        rating_stars = "⭐" * int(rating)
        log_entry = f"--- NEW FEEDBACK ({now}) ---\n"
        log_entry += f"USER NAME: {name}\n"
        log_entry += f"EMAIL: {email}\n"
        log_entry += f"RATING: {rating} Stars {rating_stars}\n"
        log_entry += f"MESSAGE: {message}\n"
        log_entry += "-" * 40 + "\n\n"

        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(log_entry)
        except Exception as e:
            print(f"Error writing to feedback file: {e}")

        return jsonify({"success": True, "message": "Feedback received and logged to file!"})

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)


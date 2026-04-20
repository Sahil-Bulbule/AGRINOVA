🥈 2nd Ranker Project – Diploma In Computer Technology (Polytechnic)

🌱 AgriNova – Smart Agriculture Web Platform

AgriNova is a modern, full-stack smart agriculture web platform designed to empower farmers and users with real-time insights, crop recommendations, and market intelligence.

It integrates weather data, mandi prices, predictive analytics, and government schemes into a clean, user-friendly interface.

🚀 Features :-

--> 🌦️ Real-Time Weather Data
   Fetch live weather using backend API integration
--> 📊 Mandi Price Analysis
   View historical data, trends, and price predictions
--> 📈 Crop Price Prediction
   Smart insights based on past data
--> 🧠 AI-Based Crop Recommendation
   Suggests crops based on:
      Month
      Temperature
      Soil Type
--> 🏛️ Government Schemes Section
   Access agriculture-related schemes
--> 💡 Smart Insights Dashboard
   Visual trends and analytics
--> 📝 Feedback System
   Users can submit feedback (stored in backend)

🏗️ Project Structure :-

AgriNova/
│
├── frontend/
│   ├── index.html
│   ├── index.css
│   └── main.js
│
├── backend/
│   ├── app.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── insights.py
│   │   ├── predictions.py
│   │   ├── recommendation.py
│   │   ├── trends.py
│   │   └── weather.py
│   │
│   ├── data/
│   │   ├── schemes.json
│   │   ├── trends_data.json
│   │   └── trends.json
│   │
│   ├── database/
│   │   └── firebase.js
│
└── README.md

🔗 Backend API Endpoints :-

--> 📡 Data APIs
    GET /weather?city=
→  Fetch real-time weather data
      GET /mandi?state=&city=&crop=
→  Get mandi prices + trends + insights
      GET /price-prediction?state=&city=&crop=
→  Predict future crop prices
      GET /insights?state=&city=&crop=
→  Analytical insights

🤖 Smart Crop Recommendation :-

POST /recommend
→ Input:
    Month
    Temperature
    Soil Type

→ Output: Recommended crops

⚙️ Setup & Installation :-

1️⃣ Clone / Open Project :-
-->  cd "c:\Users\sahil\OneDrive\Desktop\POLY PROJECT"

2️⃣ Install Backend Dependencies :-
-->  python -m pip install -r backend/requirements.txt

3️⃣ Run Backend Server :-
-->  python backend/app.py

Server runs on :-
http://localhost:5000

4️⃣ Run Frontend :-
--> Open frontend/index.html manually
    OR
--> Use Live Server (Recommended)

🌐 How It Works :- 

1] Frontend interacts with backend APIs
2] Backend processes :-
   Weather data
   Trends datasets
   Predictions & insights
3] SQLite database stores :-
   Feedback
 
📊 Data Source :-

1] Current version uses structured static / syesthematic datasets for:
   Market prices
   Trends & insights
   Government schemes
2] Designed in a way that it can be easily upgraded to:
   Real-time APIs
   Live government/agriculture datasets

🎯 Key Highlights :- 

1] Clean UI with structured sections
2] Full-stack architecture
3] Real-world agriculture use-case
4] API-driven design
5] Scalable & modular backend

📌 Future Improvements :- 

1] Live API integration for mandi prices
2] Advanced ML-based prediction models
3] Mobile responsiveness improvements
4] User dashboard analytics

👨‍💻 Author :- 

Sahil 
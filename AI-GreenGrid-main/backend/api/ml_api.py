from fastapi import FastAPI
import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "ml/models")

app = FastAPI()

print(f"Loading ML models from {MODELS_DIR}...")

renewable_model = joblib.load(os.path.join(MODELS_DIR, "renewable_model.pkl"))
demand_model = joblib.load(os.path.join(MODELS_DIR, "demand_model.pkl"))
anomaly_model = joblib.load(os.path.join(MODELS_DIR, "anomaly_model.pkl"))
intrusion_model = joblib.load(os.path.join(MODELS_DIR, "intrusion_model.pkl"))
optimization_model = joblib.load(os.path.join(MODELS_DIR, "optimization_model.pkl"))

print("All models loaded successfully")

# -------------------------
# Renewable Energy Prediction
# -------------------------

@app.post("/predict-renewable")
def predict_renewable(data: dict):
    features = [[
        data["energy_type"],
        data["temperature"],
        data["solar_radiation"],
        data["wind_speed"],
        data["water_flow"],
        data["dam_height"],
        data["installed_capacity"]
    ]]
    prediction = renewable_model.predict(features)
    return {"predicted_power": float(prediction[0])}


# -------------------------
# Electricity Demand Forecast
# -------------------------

@app.post("/predict-demand")
def predict_demand(data: dict):
    # User's custom model features: hour, temp, day, month
    features = [[
        data["hour"],
        data["temp"],
        data["day"],
        data["month"]
    ]]
    prediction = demand_model.predict(features)
    return {"predicted_demand": float(prediction[0])}


# -------------------------
# Smart Grid Anomaly Detection
# -------------------------

@app.post("/detect-anomaly")
def detect_anomaly(data: dict):
    features = [[
        data["voltage"],
        data["frequency"],
        data["load"],
        data["power_flow"],
        data["temperature"]
    ]]
    result = anomaly_model.predict(features)
    if result[0] == 1:
        status = "unstable"
    else:
        status = "stable"
    return {"grid_status": status}


# -------------------------
# Network Intrusion Detection
# -------------------------

@app.post("/detect-intrusion")
def detect_intrusion(data: dict):
    features = [[
        data["packet_size"],
        data["connection_duration"],
        data["traffic_rate"],
        data["failed_logins"]
    ]]
    result = intrusion_model.predict(features)
    if result[0] == 1:
        status = "intrusion"
    else:
        status = "normal"
    return {"network_status": status}


# -------------------------
# Energy Optimization
# -------------------------

@app.post("/optimize-energy")
def optimize_energy(data: dict):
    features = [[
        data["demand"],
        data["solar_available"],
        data["wind_available"],
        data["hydro_available"]
    ]]
    prediction = optimization_model.predict(features)
    return {
        "solar_used": float(prediction[0][0]),
        "wind_used": float(prediction[0][1]),
        "hydro_used": float(prediction[0][2])
    }

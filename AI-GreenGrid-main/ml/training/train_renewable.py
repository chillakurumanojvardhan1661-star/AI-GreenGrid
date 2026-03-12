import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

print("Loading dataset...")

data = pd.read_csv("datasets/renewable_dataset.csv")

# convert energy_type to numbers
encoder = LabelEncoder()
data["energy_type"] = encoder.fit_transform(data["energy_type"])

# features
X = data[[
    "energy_type",
    "temperature",
    "solar_radiation",
    "wind_speed",
    "water_flow",
    "dam_height",
    "installed_capacity"
]]

# target
y = data["power_output"]

print("Training model...")

model = RandomForestRegressor(n_estimators=100)

model.fit(X, y)

print("Saving model...")

joblib.dump(model, "models/renewable_model.pkl")

print("Model saved successfully!")
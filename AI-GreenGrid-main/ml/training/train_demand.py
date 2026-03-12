import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

print("Loading demand dataset...")

data = pd.read_csv("datasets/demand_dataset.csv")

X = data[[
"temperature",
"wind_speed",
"solar_radiation",
"industrial_load",
"residential_load"
]]

y = data["demand"]

print("Training demand model...")

model = RandomForestRegressor(n_estimators=100)

model.fit(X,y)

joblib.dump(model,"models/demand_model.pkl")

print("Demand model saved")
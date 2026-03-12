import pandas as pd
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
import joblib

print("Loading optimization dataset...")

data = pd.read_csv("datasets/optimization_dataset.csv")

X = data[[
"demand",
"solar_available",
"wind_available",
"hydro_available"
]]

y = data[[
"solar_used",
"wind_used",
"hydro_used"
]]

print("Training optimization model...")

model = MultiOutputRegressor(RandomForestRegressor(n_estimators=100))

model.fit(X,y)

joblib.dump(model,"models/optimization_model.pkl")

print("Optimization model saved")
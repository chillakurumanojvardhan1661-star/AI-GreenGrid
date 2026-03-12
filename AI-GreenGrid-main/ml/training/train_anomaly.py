import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

print("Loading anomaly dataset...")

data = pd.read_csv("datasets/anomaly_dataset.csv")

encoder = LabelEncoder()
data["grid_status"] = encoder.fit_transform(data["grid_status"])

X = data[[
"voltage",
"frequency",
"load",
"power_flow",
"temperature"
]]

y = data["grid_status"]

print("Training anomaly detection model...")

model = RandomForestClassifier(n_estimators=100)

model.fit(X,y)

joblib.dump(model,"models/anomaly_model.pkl")

print("Anomaly model saved")
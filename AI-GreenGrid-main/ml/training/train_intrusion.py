import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

print("Loading intrusion dataset...")

data = pd.read_csv("datasets/intrusion_dataset.csv")

encoder = LabelEncoder()
data["attack_type"] = encoder.fit_transform(data["attack_type"])

X = data[[
"packet_size",
"connection_duration",
"traffic_rate",
"failed_logins"
]]

y = data["attack_type"]

print("Training intrusion detection model...")

model = RandomForestClassifier(n_estimators=100)

model.fit(X,y)

joblib.dump(model,"models/intrusion_model.pkl")

print("Intrusion model saved")
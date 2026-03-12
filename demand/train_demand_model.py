import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

data = pd.read_csv("demand_dataset.csv")

X = data[["hour","temp","day","month"]]
y = data["demand"]

model = LinearRegression()
model.fit(X,y)

joblib.dump(model,"demand_model.pkl")

print("Model trained successfully!")
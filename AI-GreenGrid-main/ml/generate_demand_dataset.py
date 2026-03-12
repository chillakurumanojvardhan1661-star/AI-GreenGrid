import pandas as pd
import random
from datetime import datetime, timedelta

rows = []

start_date = datetime(2023,1,1)

for i in range(1000):

    date = start_date + timedelta(hours=i)

    temperature = random.uniform(20,40)
    wind_speed = random.uniform(2,15)
    solar_radiation = random.uniform(200,900)

    industrial_load = random.uniform(200,600)
    residential_load = random.uniform(100,400)

    demand = (
        industrial_load * 0.6 +
        residential_load * 0.4 +
        temperature * 3 +
        random.uniform(-20,20)
    )

    rows.append([
        date,
        temperature,
        wind_speed,
        solar_radiation,
        industrial_load,
        residential_load,
        demand
    ])

columns = [
"date",
"temperature",
"wind_speed",
"solar_radiation",
"industrial_load",
"residential_load",
"demand"
]

df = pd.DataFrame(rows, columns=columns)

df.to_csv("datasets/demand_dataset.csv", index=False)

print("Demand dataset created")
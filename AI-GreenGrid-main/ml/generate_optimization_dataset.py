import pandas as pd
import random

rows = []

for i in range(1000):

    demand = random.uniform(400,1000)

    solar_available = random.uniform(100,500)
    wind_available = random.uniform(100,500)
    hydro_available = random.uniform(200,600)

    solar_used = min(solar_available, demand * 0.4)
    wind_used = min(wind_available, demand * 0.35)
    hydro_used = min(hydro_available, demand * 0.25)

    rows.append([
        demand,
        solar_available,
        wind_available,
        hydro_available,
        solar_used,
        wind_used,
        hydro_used
    ])

columns = [
"demand",
"solar_available",
"wind_available",
"hydro_available",
"solar_used",
"wind_used",
"hydro_used"
]

df = pd.DataFrame(rows, columns=columns)

df.to_csv("datasets/optimization_dataset.csv", index=False)

print("Optimization dataset created")
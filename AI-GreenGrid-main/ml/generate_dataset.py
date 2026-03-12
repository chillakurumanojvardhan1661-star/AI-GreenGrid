import pandas as pd
import random
from datetime import datetime, timedelta

rows = []

start_date = datetime(2023,1,1)

for i in range(1000):

    date = start_date + timedelta(hours=i)

    energy_type = random.choice(["solar","wind","hydro"])

    temperature = random.uniform(20,40)
    solar_radiation = random.uniform(200,1000)
    wind_speed = random.uniform(2,15)

    water_flow = random.uniform(2000,5000)
    dam_height = random.uniform(50,150)

    installed_capacity = random.uniform(400,800)

    if energy_type == "solar":

        power_output = (
            solar_radiation * 0.45 +
            temperature * 1.2 +
            random.uniform(-20,20)
        )

    elif energy_type == "wind":

        power_output = (
            wind_speed ** 3 * 0.5 +
            random.uniform(-30,30)
        )

    else:

        power_output = (
            water_flow * dam_height * 0.0008 +
            random.uniform(-30,30)
        )

    rows.append([
        date,
        energy_type,
        round(temperature,2),
        round(solar_radiation,2),
        round(wind_speed,2),
        round(water_flow,2),
        round(dam_height,2),
        round(installed_capacity,2),
        round(power_output,2)
    ])

columns = [
"date",
"energy_type",
"temperature",
"solar_radiation",
"wind_speed",
"water_flow",
"dam_height",
"installed_capacity",
"power_output"
]

df = pd.DataFrame(rows,columns=columns)

df.to_csv("datasets/renewable_dataset.csv",index=False)

print("Dataset created successfully")
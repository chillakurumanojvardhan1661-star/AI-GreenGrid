import pandas as pd
import random

rows = []

for i in range(1000):

    voltage = random.uniform(210,250)
    frequency = random.uniform(49,51)

    load = random.uniform(200,900)
    power_flow = random.uniform(150,800)

    temperature = random.uniform(20,40)

    if load > 800 or voltage > 245 or frequency < 49.2:
        status = "unstable"
    else:
        status = "stable"

    rows.append([
        voltage,
        frequency,
        load,
        power_flow,
        temperature,
        status
    ])

columns = [
"voltage",
"frequency",
"load",
"power_flow",
"temperature",
"grid_status"
]

df = pd.DataFrame(rows,columns=columns)

df.to_csv("datasets/anomaly_dataset.csv",index=False)

print("Anomaly dataset created")
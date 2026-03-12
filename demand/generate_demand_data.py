import pandas as pd
import random

rows = []

for i in range(400):

    hour = random.randint(0,23)
    temp = random.randint(20,40)
    day = random.randint(1,7)
    month = random.randint(1,12)

    # Base demand
    demand = 200

    # Hour influence
    if 18 <= hour <= 22:
        demand += 200
    elif 6 <= hour <= 9:
        demand += 120
    else:
        demand += 60

    # Temperature influence
    demand += (temp - 20) * 8

    # Weekend reduction
    if day >= 6:
        demand -= 40

    # Seasonal increase (summer months)
    if month in [4,5,6]:
        demand += 80

    demand += random.randint(-20,20)

    rows.append([hour,temp,day,month,demand])

df = pd.DataFrame(rows, columns=["hour","temp","day","month","demand"])

df.to_csv("demand_dataset.csv", index=False)

print("Dataset generated successfully!")
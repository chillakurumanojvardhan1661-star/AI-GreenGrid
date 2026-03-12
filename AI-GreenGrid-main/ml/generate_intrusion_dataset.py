import pandas as pd
import random

rows = []

for i in range(1000):

    packet_size = random.uniform(100,1500)
    connection_duration = random.uniform(1,60)
    traffic_rate = random.uniform(10,500)
    failed_logins = random.randint(0,10)

    if traffic_rate > 400 or failed_logins > 5:
        attack = "intrusion"
    else:
        attack = "normal"

    rows.append([
        packet_size,
        connection_duration,
        traffic_rate,
        failed_logins,
        attack
    ])

columns = [
"packet_size",
"connection_duration",
"traffic_rate",
"failed_logins",
"attack_type"
]

df = pd.DataFrame(rows,columns=columns)

df.to_csv("datasets/intrusion_dataset.csv",index=False)

print("Intrusion dataset created")
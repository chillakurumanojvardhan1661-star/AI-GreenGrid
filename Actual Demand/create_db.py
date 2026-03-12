import sqlite3

conn = sqlite3.connect("grid.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE users(
id INTEGER PRIMARY KEY,
name TEXT,
base_load REAL
)
""")

users = [
("House_1",1.5),
("House_2",2.0),
("House_3",1.2),
("Shop_1",3.5),
("Factory_1",10.0),
("Office_1",5.0)
]

cursor.executemany("INSERT INTO users(name,base_load) VALUES (?,?)",users)

conn.commit()
conn.close()

print("Database created")
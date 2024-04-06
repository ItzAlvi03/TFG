import sqlite3
from models.database import dbUsers

conn = sqlite3.connect(dbUsers)
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS user (
                    id INTEGER PRIMARY KEY,
                    username TEXT NOT NULL,
                    password TEXT NOT NULL,
                    rol TEXT NOT NULL
                  )''')

usuarios = [
    ("admin", "Admin123!", "encargado"),
    ("trabajador", "Trabajador123!", "trabajador")
]

for usuario in usuarios:
    cursor.execute('''INSERT INTO user (username, password, rol)
                      VALUES (?, ?, ?)''', usuario)

conn.commit()

conn.close()
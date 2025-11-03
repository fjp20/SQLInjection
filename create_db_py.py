# create_db_py.py
import sqlite3

conn = sqlite3.connect("usuarios.db")

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
)
""")

cursor.execute("INSERT INTO usuarios (username, password) VALUES ('admin', 'admin123')")
conn.commit()
conn.close()

print("Base de datos creada correctamente.")
const sqlite3 = require("sqlite3").verbose();

// Crear/abrir la base de datos
const db = new sqlite3.Database("tienda.db");

// Crear tabla usuarios
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )
    `);

    // Insertar usuarios de prueba (vulnerable)
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
    db.run("INSERT INTO users (username, password) VALUES ('prueba', '1234')");

    console.log("✅ Base de datos creada y usuarios insertados");
});

db.close();

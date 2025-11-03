// app_fixed.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Usar ruta absoluta relativa al archivo para evitar problemas de working dir
function db() { 
  return new sqlite3.Database(path.join(__dirname, 'tienda.db')); 
}

// (Mantén aquí tu HTML si quieres la versión completa; por brevedad incluyo HTML simple)
const loginForm = `
<!doctype html><html><head><meta charset="utf-8"><title>Login</title></head><body>
<h2>Login (parcheado)</h2>
<form method="post" action="/">
  Usuario: <input name="username"><br>
  Contraseña: <input name="password" type="password"><br>
  <button type="submit">Entrar</button>
</form>
</body></html>`;

function welcomePage(user) {
  return `<h2>Bienvenido ${user}</h2><p>Has iniciado sesión.</p>`;
}

app.get('/', (req, res) => {
  res.send(loginForm);
});

app.post('/', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';

  if (!username || !password) return res.status(400).send('Rellena usuario y contraseña');

  const conn = db();

  // ----- PARCHE: consulta parametrizada (EVITA SQLi) -----
  const q = "SELECT * FROM users WHERE username = ? AND password = ?";
  console.log("Ejecutando SQL parametrizado:", q, [username, password]);

  conn.get(q, [username, password], (err, row) => {
    conn.close();
    if (err) {
      console.error("ERROR SQL (param):", err);
      return res.status(500).send("DB error");
    }
    if (row) return res.send(welcomePage(row.username));
    return res.status(401).send(`<h3>Credenciales incorrectas</h3>${loginForm}`);
  });
});

// Escuchar en 3000 (mismo puerto). Asegúrate de detener la app vulnerable primero.
app.listen(3000, '0.0.0.0', () => {
  console.log("App parcheada escuchando en http://0.0.0.0:3000");
});

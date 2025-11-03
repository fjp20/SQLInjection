const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

function db() { return new sqlite3.Database('tienda.db'); }

const loginForm = `
<!doctype html><html><head><meta charset="utf-8"><title>Login</title></head><body>
<h2>Login (vulnerable)</h2>
<form method="post" action="/">
  Usuario: <input name="username"><br>
  Contraseña: <input name="password" type="password"><br>
  <button type="submit">Entrar</button>
</form>
</body></html>`;

function welcomePage(user) {
  return `<h2>Bienvenido ${user}</h2><p>Has iniciado sesión.</p>`;
}

app.get('/', (req, res) => res.send(loginForm));

app.post('/', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';

  if (!username || !password) return res.status(400).send('Rellena usuario y contraseña');

  const conn = db();
  const q = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log("Ejecutando SQL:", q);

  conn.get(q, (err, row) => {
    conn.close();
    if (err) {
      console.error("❌ ERROR SQL:", err);
      return res.status(500).send("DB error");
    }
    if (row) return res.send(welcomePage(row.username));
    return res.status(401).send(`<h3>Credenciales incorrectas</h3>${loginForm}`);
  });
});

app.listen(3000, '0.0.0.0', () => console.log("App vulnerable en http://0.0.0.0:3000"));

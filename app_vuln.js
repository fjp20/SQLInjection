// app_vuln.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

function db() {
  return new sqlite3.Database(path.join(__dirname, 'tienda.db'));
}

/* -------------------
   HTML: LOGIN (con tu CSS)
   ------------------- */
const loginForm = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Login</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display:flex;
      justify-content:center;
      align-items:center;
      padding:20px;
    }
    .container {
      background:white;
      padding:40px;
      border-radius:20px;
      box-shadow:0 20px 60px rgba(0,0,0,0.3);
      width:100%;
      max-width:400px;
      animation: slideIn 0.5s ease-out;
    }
    @keyframes slideIn { from {opacity:0; transform:translateY(-30px);} to {opacity:1; transform:translateY(0);} }
    h2 { color:#333; text-align:center; margin-bottom:30px; font-size:28px; font-weight:600; }
    .form-group { margin-bottom:25px; }
    label { display:block; margin-bottom:8px; color:#555; font-weight:500; font-size:14px; }
    input { width:100%; padding:12px 15px; border:2px solid #e0e0e0; border-radius:10px; font-size:15px; transition:all 0.3s ease; outline:none; }
    input:focus { border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,0.1); }
    button {
      width:100%; padding:14px; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white;
      border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.3s ease; margin-top:10px;
    }
    button:hover { transform:translateY(-2px); box-shadow:0 10px 25px rgba(102,126,234,0.4); }
    .logo { text-align:center; margin-bottom:20px; }
    .logo svg { width:60px; height:60px; fill:#667eea; }
    .error { margin-bottom:12px; color:#b00020; background:#ffecec; padding:10px; border-radius:8px; border-left:4px solid #f44336; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 7l10-5v10l-10 5-10-5V4l10 5zm0 7l10-5v10l-10 5-10-5V11l10 5z"/>
      </svg>
    </div>

    <h2>Iniciar Sesión</h2>

    <!-- opcional: muestra mensaje de error si ?e=1 (usamos query param) -->
    ${/* placeholder: server will replace if needs */''}

    <form method="post" action="/">
      <div class="form-group">
        <label for="username">Usuario</label>
        <input id="username" name="username" autocomplete="username" required>
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </div>

      <button type="submit">Entrar</button>
    </form>
  </div>
</body>
</html>
`;

/* -------------------
   Dashboard HTML (panel admin) - usa el mismo "feeling" + sidebar + contenido
   function welcomeHtml(user) returns full HTML string with user embedded
   ------------------- */
function welcomeHtml(user) {
  const avatarLetter = user && user.length ? user.charAt(0).toUpperCase() : 'U';
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Dashboard - ${escapeHtml(user)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    :root { --primary-color:#667eea; --secondary-color:#764ba2; --sidebar-width:250px; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f5f7fa; }
    .sidebar { position:fixed; left:0; top:0; height:100vh; width:var(--sidebar-width); background:linear-gradient(180deg,var(--primary-color) 0%, var(--secondary-color) 100%); padding:20px; color:white; z-index:1000; }
    .sidebar-brand { font-size:24px; font-weight:bold; margin-bottom:40px; text-align:center; padding:10px 0; }
    .sidebar-menu { list-style:none; padding-left:0; }
    .sidebar-menu li { margin-bottom:10px; }
    .sidebar-menu a { display:flex; align-items:center; padding:12px 15px; color:rgba(255,255,255,0.8); text-decoration:none; border-radius:10px; transition:all 0.3s; }
    .sidebar-menu a:hover, .sidebar-menu a.active { background:rgba(255,255,255,0.2); color:white; }
    .sidebar-menu i { margin-right:12px; width:20px; }
    .main-content { margin-left:var(--sidebar-width); padding:20px; }
    .top-bar { background:white; padding:20px 30px; border-radius:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:30px; display:flex; justify-content:space-between; align-items:center; }
    .welcome-text h1 { font-size:28px; color:#333; margin:0; }
    .welcome-text p { color:#666; margin:5px 0 0 0; }
    .user-profile { display:flex; align-items:center; gap:15px; }
    .user-avatar { width:50px; height:50px; border-radius:50%; background:linear-gradient(135deg,var(--primary-color),var(--secondary-color)); display:flex; align-items:center; justify-content:center; color:white; font-size:20px; font-weight:bold; }
    .stats-container { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:20px; margin-bottom:30px; }
    .stat-card { background:white; padding:25px; border-radius:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05); display:flex; align-items:center; gap:20px; transition:transform 0.3s; }
    .stat-card:hover { transform:translateY(-5px); box-shadow:0 5px 20px rgba(0,0,0,0.1); }
    .stat-icon { width:60px; height:60px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px; color:white; }
    .stat-icon.blue { background:linear-gradient(135deg,#667eea,#764ba2); }
    .stat-icon.green { background:linear-gradient(135deg,#f093fb,#f5576c); }
    .stat-icon.orange { background:linear-gradient(135deg,#4facfe,#00f2fe); }
    .stat-icon.purple { background:linear-gradient(135deg,#43e97b,#38f9d7); }
    .stat-info h3 { font-size:14px; color:#666; margin:0; font-weight:normal; }
    .stat-info p { font-size:28px; color:#333; margin:5px 0 0 0; font-weight:bold; }
    .content-grid { display:grid; grid-template-columns:2fr 1fr; gap:20px; }
    .card { background:white; padding:25px; border-radius:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05); }
    .card h3 { color:#333; margin-bottom:20px; font-size:20px; }
    .activity-item { display:flex; align-items:center; padding:15px; border-bottom:1px solid #f0f0f0; }
    .activity-item:last-child { border-bottom:none; }
    .activity-icon { width:40px; height:40px; border-radius:50%; background:#f5f7fa; display:flex; align-items:center; justify-content:center; margin-right:15px; color:var(--primary-color); }
    .activity-info { flex:1; }
    .activity-info h4 { font-size:14px; color:#333; margin:0; }
    .activity-info p { font-size:12px; color:#999; margin:5px 0 0 0; }
    @media (max-width:768px) {
      .sidebar { width:0; padding:0; overflow:hidden; }
      .main-content { margin-left:0; }
      .content-grid { grid-template-columns:1fr; }
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="sidebar-brand"><i class="fas fa-cube"></i> MiApp</div>
    <ul class="sidebar-menu">
      <li><a href="#" class="active"><i class="fas fa-home"></i> Dashboard</a></li>
      <li><a href="#"><i class="fas fa-chart-line"></i> Estadísticas</a></li>
      <li><a href="#"><i class="fas fa-users"></i> Usuarios</a></li>
      <li><a href="#"><i class="fas fa-file-alt"></i> Documentos</a></li>
      <li><a href="#"><i class="fas fa-cog"></i> Configuración</a></li>
      <li><a href="/"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a></li>
    </ul>
  </div>

  <div class="main-content">
    <div class="top-bar">
      <div class="welcome-text">
        <h1>¡Bienvenido, ${escapeHtml(user)}!</h1>
        <p>Es bueno tenerte de vuelta</p>
      </div>
      <div class="user-profile">
        <div>
          <strong>${escapeHtml(user)}</strong>
          <p style="margin:0;color:#999;font-size:14px;">Administrador</p>
        </div>
        <div class="user-avatar">${avatarLetter}</div>
      </div>
    </div>

    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-users"></i></div>
        <div class="stat-info"><h3>Usuarios Activos</h3><p>2,543</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-shopping-cart"></i></div>
        <div class="stat-info"><h3>Ventas del Mes</h3><p>$45,678</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-chart-line"></i></div>
        <div class="stat-info"><h3>Crecimiento</h3><p>+23.5%</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i class="fas fa-star"></i></div>
        <div class="stat-info"><h3>Calificación</h3><p>4.8/5.0</p></div>
      </div>
    </div>

    <div class="content-grid">
      <div class="card">
        <h3><i class="fas fa-clock"></i> Actividad Reciente</h3>
        <div class="activity-item"><div class="activity-icon"><i class="fas fa-user-plus"></i></div><div class="activity-info"><h4>Nuevo usuario registrado</h4><p>Hace 5 minutos</p></div></div>
        <div class="activity-item"><div class="activity-icon"><i class="fas fa-download"></i></div><div class="activity-info"><h4>Reporte generado exitosamente</h4><p>Hace 1 hora</p></div></div>
        <div class="activity-item"><div class="activity-icon"><i class="fas fa-check-circle"></i></div><div class="activity-info"><h4>Tarea completada</h4><p>Hace 2 horas</p></div></div>
        <div class="activity-item"><div class="activity-icon"><i class="fas fa-bell"></i></div><div class="activity-info"><h4>Nueva notificación del sistema</h4><p>Hace 3 horas</p></div></div>
      </div>

      <div class="card">
        <h3><i class="fas fa-tasks"></i> Tareas Pendientes</h3>
        <div class="activity-item"><div class="activity-icon"><i class="fas fa-circle" style="font-size:8px;"></i></div><div class="activity-info"><h4>Revisar informes mensuales</h4><p>Vence hoy</p></div></div>
        <div class="activity-item"><div class="activity-icon"><i class="fas fa-circle" style="font-size:8px;"></i></div><div class="activity-info"><h4>Actualizar documentación</h4><p>Vence mañana</p></div></div>
        <div class="activity-item"><div class="activity-icon"><i class="fas fa-circle" style="font-size:8px;"></i></div><div class="activity-info"><h4>Reunión de equipo</h4><p>Próxima semana</p></div></div>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
</body>
</html>
`;
}

/* simple helper to avoid XSS when injecting username */
function escapeHtml(unsafe) {
  return String(unsafe || '').replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    })[s];
  });
}

/* -------------------
   Routes
   ------------------- */
app.get('/', (req, res) => {
  // if ?e=1 show error message in login form, we can embed dynamically:
  const showError = req.query.e === '1';
  let html = loginForm;
  if (showError) {
    // inject a small error block after .logo div
    html = html.replace('</div>\n\n    <h2>Iniciar Sesión</h2>',
      '</div>\n\n    <div class="error">⚠️ Credenciales incorrectas. Por favor intenta de nuevo.</div>\n\n    <h2>Iniciar Sesión</h2>');
  }
  res.send(html);
});

app.post('/', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';

  if (!username || !password) return res.status(400).send('Rellena usuario y contraseña');

  const conn = db();

  // -------- VULNERABLE (intencional) ----------
  const q = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log("Ejecutando SQL:", q);

  conn.get(q, (err, row) => {
    conn.close();
    if (err) {
      console.error("❌ ERROR SQL:", err);
      return res.status(500).send("DB error");
    }
    if (row) {
      // success -> render dashboard with same CSS look
      return res.send(welcomeHtml(row.username));
    } else {
      // redirect to login with error flag (so message shows)
      return res.redirect('/?e=1');
    }
  });
});

/* start server */
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App vulnerable escuchando en http://0.0.0.0:${PORT}`);
});

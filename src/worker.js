// worker.js (solo muestro las partes cambiadas, el resto igual que antes)

export default {
  async fetch(request, env, ctx) {
    // ... el resto del código igual (API, CRUD clientes, etc.)

    if (["/", "/index", "/index.html"].includes(url.pathname)) {
      return new Response(getHTML(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // ... resto igual
  },
};

function getHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP Alquiler de Botes - Dramon</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { margin:0; font-family:system-ui, sans-serif; background:#f1f3f5; color:#212529; }
    .layout { display:flex; min-height:100vh; }
    .sidebar {
      width:220px; background:#343a40; color:white; padding:1.5rem 1rem;
      flex-shrink:0; box-shadow:2px 0 5px rgba(0,0,0,0.1);
    }
    .sidebar h3 { margin:0 0 1.5rem; font-size:1.4rem; text-align:center; }
    .sidebar ul { list-style:none; padding:0; margin:0; }
    .sidebar li { margin:0.5rem 0; }
    .sidebar a {
      color:white; text-decoration:none; display:block; padding:0.6rem 1rem;
      border-radius:0.375rem; cursor:pointer;
    }
    .sidebar a:hover, .sidebar a.active { background:#495057; }
    .main { flex:1; padding:1.5rem; }
    .header { margin-bottom:1.5rem; }
    .header h1 { margin:0; font-size:1.8rem; }
    .content { background:white; border-radius:0.5rem; padding:1.5rem; box-shadow:0 0.125rem 0.25rem rgba(0,0,0,0.075); }
    .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-bottom:2rem; }
    .card { background:#fff; padding:1.25rem; border-radius:0.5rem; box-shadow:0 0.125rem 0.25rem rgba(0,0,0,0.075); text-align:center; }
    /* ... resto de estilos de tablas, modal, botones como antes ... */
  </style>
</head>
<body>

<div class="layout">
  <!-- Sidebar / Menú vertical -->
  <nav class="sidebar">
    <h3>ERP Botes</h3>
    <ul>
      <li><a onclick="showDashboard()" class="active">Dashboard</a></li>
      <li><a onclick="loadCustomers()">Clientes</a></li>
      <li><a>Botes</a></li>
      <li><a>Alquileres</a></li>
      <li><a>Reportes</a></li>
      <li><a>Configuración</a></li>
    </ul>
  </nav>

  <!-- Contenido principal -->
  <main class="main">
    <div class="header">
      <h1>Bienvenido, Dramon</h1>
      <p style="color:#6c757d; margin:0.25rem 0 0;">Sistema de Alquiler de Botes • Santo Domingo</p>
    </div>

    <div id="dashboard" class="content" style="display:block;">
      <div class="cards">
        <div class="card"><h5>Ingresos Hoy</h5><h3 id="income">$0</h3></div>
        <div class="card"><h5>Alquileres Activos</h5><h3 id="active">0</h3></div>
        <div class="card"><h5>Botes Disponibles</h5><h3 id="boats">0</h3></div>
        <div class="card"><h5>Total Clientes</h5><h3 id="customers">0</h3></div>
      </div>
      <!-- Gráficos ... igual que antes -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(400px,1fr)); gap:1.5rem;">
        <div class="card"><h5>Resumen Ingresos</h5><canvas id="barChart"></canvas></div>
        <div class="card"><h5>Tendencia Alquileres</h5><canvas id="lineChart"></canvas></div>
        <div class="card" style="grid-column:1/-1;"><h5>Distribución Estado Botes</h5><canvas id="pieChart"></canvas></div>
      </div>
    </div>

    <div id="customersModule" class="content" style="display:none;">
      <!-- ... el módulo de clientes igual que antes ... -->
    </div>
  </main>
</div>

<!-- Modal de cliente igual que antes -->

<script>
// ... el mismo JavaScript de antes, solo ajustamos showDashboard y loadCustomers para manejar la clase "active" si quieres
function showDashboard() {
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('customersModule').style.display = 'none';
  // Opcional: quitar .active de todos y poner en Dashboard
}

function loadCustomers() {
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('customersModule').style.display = 'block';
  fetchCustomers();
}

// ... resto del script igual
</script>
</body>
</html>`;
}

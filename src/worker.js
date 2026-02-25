export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    /* ===============================
       FRONTEND (ERP UI)
    =============================== */
    if (url.pathname === "/") {
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }

    /* ===============================
       API CLIENTES
    =============================== */
    if (url.pathname === "/api/clientes" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM clientes ORDER BY id DESC"
      ).all();
      return Response.json(results);
    }

    if (url.pathname === "/api/clientes" && request.method === "POST") {
      const data = await request.json();
      await env.DB.prepare(
        "INSERT INTO clientes (nombre, telefono, email) VALUES (?, ?, ?)"
      )
        .bind(data.nombre, data.telefono, data.email)
        .run();
      return Response.json({ success: true });
    }

    /* ===============================
       API BOTES
    =============================== */
    if (url.pathname === "/api/botes" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM botes ORDER BY id DESC"
      ).all();
      return Response.json(results);
    }

    if (url.pathname === "/api/botes" && request.method === "POST") {
      const data = await request.json();
      await env.DB.prepare(
        "INSERT INTO botes (nombre, precio_hora, estado) VALUES (?, ?, ?)"
      )
        .bind(data.nombre, data.precio_hora, data.estado)
        .run();
      return Response.json({ success: true });
    }

    /* ===============================
       API RESERVAS
    =============================== */
    if (url.pathname === "/api/reservas" && request.method === "GET") {
      const { results } = await env.DB.prepare(`
        SELECT r.id, c.nombre as cliente, b.nombre as bote,
               r.fecha, r.horas, r.total
        FROM reservas r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN botes b ON r.bote_id = b.id
        ORDER BY r.id DESC
      `).all();
      return Response.json(results);
    }

    if (url.pathname === "/api/reservas" && request.method === "POST") {
      const data = await request.json();
      await env.DB.prepare(
        "INSERT INTO reservas (cliente_id, bote_id, fecha, horas, total) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(
          data.cliente_id,
          data.bote_id,
          data.fecha,
          data.horas,
          data.total
        )
        .run();
      return Response.json({ success: true });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404
    });
  }
};

/* ===============================
   HTML ERP COMPLETO
=============================== */

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Boat Rental ERP</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body { margin:0; font-family:Arial; background:#f4f6f9; }

.navbar {
  background:#0d47a1;
  padding:15px;
  color:white;
  display:flex;
  gap:25px;
  font-weight:bold;
}

.navbar span {
  cursor:pointer;
}

.container { padding:20px; }

.card {
  background:white;
  padding:20px;
  margin-bottom:20px;
  border-radius:8px;
  box-shadow:0 2px 8px rgba(0,0,0,0.1);
}

.grid {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:20px;
}

input, select {
  padding:8px;
  margin:5px;
}

button {
  background:#0d47a1;
  color:white;
  padding:8px 15px;
  border:none;
  cursor:pointer;
  border-radius:5px;
}

table {
  width:100%;
  border-collapse:collapse;
}

th, td {
  padding:8px;
  border-bottom:1px solid #ddd;
}
</style>
</head>
<body>

<div class="navbar">
  <span onclick="show('dashboard')">Dashboard</span>
  <span onclick="show('clientes')">Clientes</span>
  <span onclick="show('botes')">Botes</span>
  <span onclick="show('reservas')">Reservas</span>
</div>

<div class="container">

  <!-- DASHBOARD -->
  <div id="dashboard" class="card">
    <h2>Dashboard General</h2>
    <div class="grid">
      <canvas id="lineChart"></canvas>
      <canvas id="barChart"></canvas>
      <canvas id="pieChart"></canvas>
    </div>
  </div>

  <!-- CLIENTES -->
  <div id="clientes" class="card" style="display:none">
    <h2>Clientes</h2>
    <input id="cNombre" placeholder="Nombre">
    <input id="cTelefono" placeholder="Teléfono">
    <input id="cEmail" placeholder="Email">
    <button onclick="addCliente()">Guardar</button>
    <div id="tablaClientes"></div>
  </div>

  <!-- BOTES -->
  <div id="botes" class="card" style="display:none">
    <h2>Botes</h2>
    <input id="bNombre" placeholder="Nombre">
    <input id="bPrecio" placeholder="Precio Hora">
    <select id="bEstado">
      <option value="Disponible">Disponible</option>
      <option value="Mantenimiento">Mantenimiento</option>
    </select>
    <button onclick="addBote()">Guardar</button>
    <div id="tablaBotes"></div>
  </div>

  <!-- RESERVAS -->
  <div id="reservas" class="card" style="display:none">
    <h2>Reservas</h2>
    <input id="rCliente" placeholder="ID Cliente">
    <input id="rBote" placeholder="ID Bote">
    <input id="rFecha" type="date">
    <input id="rHoras" placeholder="Horas">
    <input id="rTotal" placeholder="Total">
    <button onclick="addReserva()">Guardar</button>
    <div id="tablaReservas"></div>
  </div>

</div>

<script>
function show(id){
  document.querySelectorAll('.card').forEach(c=>c.style.display='none');
  document.getElementById(id).style.display='block';
}

/* DASHBOARD CHARTS */
new Chart(document.getElementById('lineChart'), {
  type: 'line',
  data: {
    labels: ['Lun','Mar','Mie','Jue','Vie','Sab','Dom'],
    datasets: [{ label:'Ingresos', data:[100,200,150,300,250,400,350] }]
  }
});

new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels:['Bote A','Bote B','Bote C'],
    datasets:[{ label:'Reservas', data:[5,8,3] }]
  }
});

new Chart(document.getElementById('pieChart'), {
  type: 'pie',
  data: {
    labels:['Disponible','Mantenimiento'],
    datasets:[{ data:[4,1] }]
  }
});

/* CLIENTES */
async function addCliente(){
  await fetch('/api/clientes',{method:'POST',body:JSON.stringify({
    nombre:cNombre.value,
    telefono:cTelefono.value,
    email:cEmail.value
  })});
  loadClientes();
}

async function loadClientes(){
  const res=await fetch('/api/clientes');
  const data=await res.json();
  tablaClientes.innerHTML='<table><tr><th>ID</th><th>Nombre</th><th>Tel</th><th>Email</th></tr>'+
  data.map(c=>\`<tr><td>\${c.id}</td><td>\${c.nombre}</td><td>\${c.telefono}</td><td>\${c.email}</td></tr>\`).join('')+
  '</table>';
}
loadClientes();

/* BOTES */
async function addBote(){
  await fetch('/api/botes',{method:'POST',body:JSON.stringify({
    nombre:bNombre.value,
    precio_hora:bPrecio.value,
    estado:bEstado.value
  })});
  loadBotes();
}

async function loadBotes(){
  const res=await fetch('/api/botes');
  const data=await res.json();
  tablaBotes.innerHTML='<table><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Estado</th></tr>'+
  data.map(b=>\`<tr><td>\${b.id}</td><td>\${b.nombre}</td><td>\${b.precio_hora}</td><td>\${b.estado}</td></tr>\`).join('')+
  '</table>';
}
loadBotes();

/* RESERVAS */
async function addReserva(){
  await fetch('/api/reservas',{method:'POST',body:JSON.stringify({
    cliente_id:rCliente.value,
    bote_id:rBote.value,
    fecha:rFecha.value,
    horas:rHoras.value,
    total:rTotal.value
  })});
  loadReservas();
}

async function loadReservas(){
  const res=await fetch('/api/reservas');
  const data=await res.json();
  tablaReservas.innerHTML='<table><tr><th>ID</th><th>Cliente</th><th>Bote</th><th>Fecha</th><th>Horas</th><th>Total</th></tr>'+
  data.map(r=>\`<tr><td>\${r.id}</td><td>\${r.cliente}</td><td>\${r.bote}</td><td>\${r.fecha}</td><td>\${r.horas}</td><td>\${r.total}</td></tr>\`).join('')+
  '</table>';
}
loadReservas();

</script>

</body>
</html>
`;

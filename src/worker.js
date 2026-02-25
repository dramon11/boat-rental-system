// worker.js - ES Module compatible con D1
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // -----------------------
    // Dashboard y Frontend
    // -----------------------
    if (url.pathname === "/" || url.pathname === "/index") {
      return new Response(getHTML(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // -----------------------
    // API Clientes
    // -----------------------
    if (url.pathname.startsWith("/api/customers")) {
      if (request.method === "GET") {
        const res = await env.DB.prepare("SELECT * FROM customers").all();
        return new Response(JSON.stringify(res.results), { headers: { "Content-Type": "application/json" } });
      }

      if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
          "INSERT INTO customers (name, document_id, phone) VALUES (?, ?, ?)"
        ).bind(data.name, data.document_id, data.phone).run();
        return new Response(JSON.stringify({ success: true }));
      }

      if (request.method === "PUT") {
        const data = await request.json();
        await env.DB.prepare(
          "UPDATE customers SET name = ?, document_id = ?, phone = ? WHERE id = ?"
        ).bind(data.name, data.document_id, data.phone, data.id).run();
        return new Response(JSON.stringify({ success: true }));
      }

      if (request.method === "DELETE") {
        const data = await request.json();
        await env.DB.prepare("DELETE FROM customers WHERE id = ?").bind(data.id).run();
        return new Response(JSON.stringify({ success: true }));
      }
    }

    // -----------------------
    // API Dashboard
    // -----------------------
    if (url.pathname.startsWith("/api/dashboard")) {
      // Obtener datos reales de la DB
      const clientes = await env.DB.prepare("SELECT COUNT(*) AS total FROM customers").first();
      const botes = await env.DB.prepare("SELECT COUNT(*) AS total FROM boats").first();
      const reservas = await env.DB.prepare("SELECT COUNT(*) AS total FROM reservations").first();

      const ingresosMensuales = await env.DB.prepare(
        "SELECT strftime('%m', created_at) AS mes, SUM(amount) AS total FROM reservations GROUP BY mes"
      ).all();

      return new Response(JSON.stringify({
        clientes: clientes.total || 0,
        botes: botes.total || 0,
        reservas: reservas.total || 0,
        ingresosMensuales: ingresosMensuales.results || []
      }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("Not found", { status: 404 });
  }
};

// -----------------------
// HTML + JS Frontend
// -----------------------
function getHTML() {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>ERP Sistema de Clientes y Dashboard</title>
<style>
body { margin:0; font-family: Arial, sans-serif; display:flex; height:100vh; }
nav { width:220px; background:#343a40; color:white; display:flex; flex-direction:column; padding:20px; }
nav a { color:white; text-decoration:none; margin:10px 0; padding:10px; border-radius:5px; display:block; }
nav a:hover { background:#495057; }
main { flex:1; padding:20px; overflow:auto; background:#f5f5f5; }
.cards { display:flex; gap:20px; margin-bottom:20px; }
.card { background:white; padding:15px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); flex:1; text-align:center; }
table { width:100%; border-collapse:collapse; background:white; border-radius:10px; overflow:hidden; margin-top:20px; }
th, td { padding:10px; border-bottom:1px solid #ddd; text-align:left; }
th { background:#007bff; color:white; }
button { padding:5px 10px; border:none; border-radius:5px; cursor:pointer; }
button.edit { background:#28a745; color:white; }
button.delete { background:#dc3545; color:white; }
</style>
</head>
<body>
<nav>
  <h2>Menú</h2>
  <a href="#">Dashboard</a>
  <a href="#">Clientes</a>
  <a href="#">Botes</a>
  <a href="#">Reservas</a>
</nav>
<main>
<h1>Dashboard</h1>
<div class="cards">
  <div class="card"><canvas id="pieChart"></canvas></div>
  <div class="card"><canvas id="barChart"></canvas></div>
  <div class="card"><canvas id="lineChart"></canvas></div>
</div>

<h1>Clientes</h1>
<div>
  <table id="customersTable">
    <thead>
      <tr>
        <th>ID</th><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// -------------------
// Clientes
// -------------------
async function fetchCustomers() {
  const res = await fetch('/api/customers');
  const data = await res.json();
  const tbody = document.querySelector("#customersTable tbody");
  tbody.innerHTML = "";
  data.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = \`
      <td>\${c.id}</td>
      <td>\${c.name}</td>
      <td>\${c.document_id}</td>
      <td>\${c.phone}</td>
      <td>
        <button class="edit" onclick='editCustomer(\${JSON.stringify(c)})'>Editar</button>
        <button class="delete" onclick='deleteCustomer(\${c.id})'>Eliminar</button>
      </td>
    \`;
    tbody.appendChild(tr);
  });
}

async function deleteCustomer(id) {
  if(!confirm("¿Seguro que deseas eliminar este cliente?")) return;
  await fetch('/api/customers', { method:"DELETE", body:JSON.stringify({id}), headers:{'Content-Type':'application/json'} });
  fetchCustomers();
}

function editCustomer(c) {
  const name = prompt("Nombre:", c.name);
  const doc = prompt("Documento:", c.document_id);
  const phone = prompt("Teléfono:", c.phone);
  if(name && doc && phone) {
    fetch('/api/customers', { method:"PUT", body:JSON.stringify({id:c.id,name,document_id:doc,phone}), headers:{'Content-Type':'application/json'} })
      .then(()=>fetchCustomers());
  }
}

fetchCustomers();

// -------------------
// Dashboard con datos reales
// -------------------
async function fetchDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();

  // Pie chart
  new Chart(document.getElementById('pieChart').getContext('2d'), {
    type: 'pie',
    data: {
      labels: ['Clientes','Botes','Reservas'],
      datasets:[{ data:[data.clientes, data.botes, data.reservas], backgroundColor:['#007bff','#28a745','#dc3545'] }]
    }
  });

  // Bar chart
  new Chart(document.getElementById('barChart').getContext('2d'), {
    type:'bar',
    data:{ 
      labels: data.ingresosMensuales.map(i=>i.mes),
      datasets:[{ label:'Ingresos', data: data.ingresosMensuales.map(i=>i.total), backgroundColor:'#007bff' }]
    }
  });

  // Line chart
  new Chart(document.getElementById('lineChart').getContext('2d'), {
    type:'line',
    data:{
      labels: data.ingresosMensuales.map(i=>i.mes),
      datasets:[{ label:'Ingresos', data:data.ingresosMensuales.map(i=>i.total), borderColor:'#28a745', fill:false }]
    }
  });
}

fetchDashboard();
</script>
</body>
</html>
`;
}

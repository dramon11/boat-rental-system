// worker.js - Formato ES Module para Cloudflare Worker + D1

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
        return new Response(JSON.stringify(res.results), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
          "INSERT INTO customers (name, document_id, phone) VALUES (?, ?, ?)"
        )
          .bind(data.name, data.document_id, data.phone)
          .run();
        return new Response(JSON.stringify({ success: true }));
      }

      if (request.method === "PUT") {
        const data = await request.json();
        await env.DB.prepare(
          "UPDATE customers SET name = ?, document_id = ?, phone = ? WHERE id = ?"
        )
          .bind(data.name, data.document_id, data.phone, data.id)
          .run();
        return new Response(JSON.stringify({ success: true }));
      }

      if (request.method === "DELETE") {
        const data = await request.json();
        await env.DB.prepare("DELETE FROM customers WHERE id = ?")
          .bind(data.id)
          .run();
        return new Response(JSON.stringify({ success: true }));
      }
    }

    return new Response("Not found", { status: 404 });
  },
};

// -----------------------
// HTML + JS del Frontend
// -----------------------
function getHTML() {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>ERP Sistema de Clientes y Dashboard</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; background:#f5f5f5; }
h1 { text-align:center; }
.cards { display:flex; gap:20px; margin-bottom:20px; }
.card { background:white; padding:15px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); flex:1; text-align:center; }
table { width:100%; border-collapse:collapse; background:white; border-radius:10px; overflow:hidden; }
th, td { padding:10px; border-bottom:1px solid #ddd; text-align:left; }
th { background:#007bff; color:white; }
button { padding:5px 10px; border:none; border-radius:5px; cursor:pointer; }
button.edit { background:#28a745; color:white; }
button.delete { background:#dc3545; color:white; }
</style>
</head>
<body>

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

// Inicializar tabla
fetchCustomers();

// -------------------------
// Gráficos (Dashboard)
// -------------------------
const pieCtx = document.getElementById('pieChart').getContext('2d');
const barCtx = document.getElementById('barChart').getContext('2d');
const lineCtx = document.getElementById('lineChart').getContext('2d');

const pieChart = new Chart(pieCtx, {
  type: 'pie',
  data: { labels: ['Clientes', 'Botes', 'Reservas'], datasets:[{ data:[10,20,30], backgroundColor:['#007bff','#28a745','#dc3545'] }] },
});

const barChart = new Chart(barCtx, {
  type:'bar',
  data:{ labels:['Enero','Febrero','Marzo'], datasets:[{ label:'Reservas', data:[5,10,15], backgroundColor:'#007bff' }] },
});

const lineChart = new Chart(lineCtx,{
  type:'line',
  data:{ labels:['Semana 1','Semana 2','Semana 3'], datasets:[{ label:'Ingresos', data:[100,200,150], borderColor:'#28a745', fill:false }] },
});
</script>
</body>
</html>
`;
}

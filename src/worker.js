export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    try {

      /* =============================
         FRONTEND ERP
      ============================== */
      if (url.pathname === "/" && request.method === "GET") {
        return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Boat Rental ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
*{box-sizing:border-box}
body{
  margin:0;
  font-family:'Inter',sans-serif;
  background:#f1f5f9;
}

/* SIDEBAR */
.sidebar{
  width:240px;
  height:100vh;
  background:#0f172a;
  color:#fff;
  position:fixed;
  padding:25px 20px;
}
.sidebar h2{
  margin:0 0 40px 0;
  font-weight:700;
}
.menu-item{
  padding:12px 14px;
  border-radius:8px;
  margin-bottom:10px;
  cursor:pointer;
  transition:.2s;
}
.menu-item:hover{
  background:#1e293b;
}
.menu-item.active{
  background:#2563eb;
}

/* HEADER */
.header{
  margin-left:240px;
  height:65px;
  background:#1e3a8a;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 30px;
  color:white;
  font-weight:600;
}

/* CONTENT */
.content{
  margin-left:240px;
  padding:30px;
}

/* CARDS */
.cards{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:20px;
}
.card{
  background:white;
  padding:20px;
  border-radius:14px;
  box-shadow:0 6px 20px rgba(0,0,0,0.05);
}
.card h4{
  margin:0;
  font-weight:600;
  color:#64748b;
}
.card h2{
  margin:10px 0 0 0;
}

/* CHART AREA */
.charts{
  margin-top:40px;
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:30px;
}
.chart-box{
  background:white;
  padding:25px;
  border-radius:14px;
  box-shadow:0 6px 20px rgba(0,0,0,0.05);
}
.full-width{
  grid-column:span 2;
}
</style>
</head>

<body>

<div class="sidebar">
  <h2>⚓ BoatERP</h2>

  <div class="menu-item active">Dashboard</div>
  <div class="menu-item">Clientes</div>
  <div class="menu-item">Botes</div>
  <div class="menu-item">Alquileres</div>
  <div class="menu-item">Pagos</div>
  <div class="menu-item">Reportes</div>
  <div class="menu-item">Configuración</div>
</div>

<div class="header">
  <div>Panel Administrativo</div>
  <div>Admin</div>
</div>

<div class="content">

  <div class="cards">
    <div class="card">
      <h4>Ingresos Hoy</h4>
      <h2 id="income">$0</h2>
    </div>
    <div class="card">
      <h4>Alquileres Activos</h4>
      <h2 id="active">0</h2>
    </div>
    <div class="card">
      <h4>Botes Disponibles</h4>
      <h2 id="boats">0</h2>
    </div>
    <div class="card">
      <h4>Total Clientes</h4>
      <h2 id="customers">0</h2>
    </div>
  </div>

  <div class="charts">
    <div class="chart-box">
      <h4>Resumen General (Barras)</h4>
      <canvas id="barChart"></canvas>
    </div>

    <div class="chart-box">
      <h4>Tendencia (Línea)</h4>
      <canvas id="lineChart"></canvas>
    </div>

    <div class="chart-box full-width">
      <h4>Distribución (Pie)</h4>
      <canvas id="pieChart"></canvas>
    </div>
  </div>

</div>

<script>

async function loadDashboard(){
  const res = await fetch("/api/dashboard");
  const data = await res.json();

  document.getElementById("income").innerText = "$" + data.income_today;
  document.getElementById("active").innerText = data.active_rentals;
  document.getElementById("boats").innerText = data.available_boats;
  document.getElementById("customers").innerText = data.total_customers;

  const values = [
    data.income_today,
    data.active_rentals,
    data.available_boats,
    data.total_customers
  ];

  /* BAR */
  new Chart(document.getElementById("barChart"),{
    type:"bar",
    data:{
      labels:["Ingresos","Activos","Disponibles","Clientes"],
      datasets:[{ data:values }]
    }
  });

  /* LINE */
  new Chart(document.getElementById("lineChart"),{
    type:"line",
    data:{
      labels:["Ingresos","Activos","Disponibles","Clientes"],
      datasets:[{
        data:values,
        tension:0.4
      }]
    }
  });

  /* PIE */
  new Chart(document.getElementById("pieChart"),{
    type:"pie",
    data:{
      labels:["Ingresos","Activos","Disponibles","Clientes"],
      datasets:[{ data:values }]
    }
  });

}


/* =========================
   CLIENTES - VERSION PRO
========================= */

async function loadCustomers() {

  const container = document.getElementById("mainContent");

  container.innerHTML = `
    <div class="module-header">
      <div>
        <h2>Clientes</h2>
        <p class="subtitle">Gestión y administración de clientes registrados</p>
      </div>
      <div class="actions">
        <input id="searchInput" class="input-search" 
          placeholder="Buscar por nombre o documento..." />
        <button class="btn-primary" onclick="openCustomerModal()">
          + Nuevo Cliente
        </button>
      </div>
    </div>

    <div class="card">
      <div id="loader" class="loader">Cargando clientes...</div>
      <div id="customerTable"></div>
    </div>

    <!-- Modal -->
    <div id="customerModal" class="modal-overlay">
      <div class="modal">
        <h3>Nuevo Cliente</h3>
        <div class="form-group">
          <input id="name" placeholder="Nombre completo" />
          <input id="doc" placeholder="Documento" />
          <input id="phone" placeholder="Teléfono" />
          <input id="email" placeholder="Email" />
        </div>
        <div class="modal-actions">
          <button class="btn-success" onclick="saveCustomer()">Guardar</button>
          <button class="btn-secondary" onclick="closeCustomerModal()">Cancelar</button>
        </div>
      </div>
    </div>

    <div id="toast" class="toast"></div>
  `;

  await fetchCustomers();
}

async function fetchCustomers() {
  document.getElementById("loader").style.display = "block";

  const res = await fetch("/api/customers");
  const data = await res.json();

  document.getElementById("loader").style.display = "none";

  renderCustomerTable(data);

  document.getElementById("searchInput").addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    const filtered = data.filter(c =>
      c.full_name.toLowerCase().includes(value) ||
      c.document_id.toLowerCase().includes(value)
    );
    renderCustomerTable(filtered);
  });
}

function renderCustomerTable(data) {

  if (data.length === 0) {
    document.getElementById("customerTable").innerHTML = `
      <div class="empty-state">
        <p>No hay clientes registrados.</p>
      </div>
    `;
    return;
  }

  let html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Documento</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(c => {
    html += `
      <tr>
        <td>${c.full_name}</td>
        <td>${c.document_id}</td>
        <td>${c.phone || "-"}</td>
        <td>${c.email || "-"}</td>
        <td>
          <button class="btn-danger-sm"
            onclick="deleteCustomer(${c.id})">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";

  document.getElementById("customerTable").innerHTML = html;
}

function openCustomerModal() {
  document.getElementById("customerModal").classList.add("active");
}

function closeCustomerModal() {
  document.getElementById("customerModal").classList.remove("active");
}

async function saveCustomer() {

  const body = {
    full_name: document.getElementById("name").value,
    document_id: document.getElementById("doc").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value
  };

  const res = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    showToast("Cliente creado correctamente", "success");
    closeCustomerModal();
    fetchCustomers();
  } else {
    showToast("Error al crear cliente", "error");
  }
}

async function deleteCustomer(id) {

  if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

  await fetch("/api/customers/" + id, { method: "DELETE" });

  showToast("Cliente eliminado", "success");
  fetchCustomers();
}

function showToast(message, type) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = "toast show " + type;
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}




loadDashboard();

</script>

</body>
</html>
        `,{
          headers:{"Content-Type":"text/html"}
        });
      }

      /* =============================
         API DASHBOARD
      ============================== */

      if (url.pathname === "/api/dashboard") {

        const income = await env.DB.prepare(
          "SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')"
        ).first();

        const active = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM rentals WHERE status='active'"
        ).first();

        const boats = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM boats WHERE status='available'"
        ).first();

        const customers = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM customers"
        ).first();

        return json({
          income_today: income.total,
          active_rentals: active.total,
          available_boats: boats.total,
          total_customers: customers.total
        });
      }

      return json({error:"Not Found"},404);

    } catch (err) {
      return json({error:err.message},500);
    }
  }
}


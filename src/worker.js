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
        return new Response(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Boat Rental ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:'Inter',sans-serif;background:#f1f5f9}

/* SIDEBAR */
.sidebar{width:240px;height:100vh;background:#0f172a;color:#fff;position:fixed;padding:25px 20px}
.sidebar h2{margin:0 0 40px 0;font-weight:700}
.menu-item{padding:12px 14px;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:.2s}
.menu-item:hover{background:#1e293b}
.menu-item.active{background:#2563eb}

/* HEADER */
.header{margin-left:240px;height:65px;background:#1e3a8a;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:white;font-weight:600}

/* CONTENT */
.content{margin-left:240px;padding:30px}

/* CARDS */
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.card{background:white;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05)}
.card h4{margin:0;font-weight:600;color:#64748b}
.card h2{margin:10px 0 0 0}

/* CHART AREA */
.charts{margin-top:40px;display:grid;grid-template-columns:repeat(2,1fr);gap:30px}
.chart-box{background:white;padding:25px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05)}
.full-width{grid-column:span 2}

/* TABLE */
.data-table{width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden}
.data-table th, .data-table td{padding:10px;text-align:left;border-bottom:1px solid #eee}
.data-table th{background:#f1f5f9}

/* BUTTONS */
.btn-primary{padding:8px 12px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer}
.btn-success{padding:8px 12px;background:#16a34a;color:white;border:none;border-radius:8px;cursor:pointer}
.btn-secondary{padding:8px 12px;border:none;border-radius:8px;cursor:pointer}
.btn-danger-sm{padding:5px 10px;background:#dc2626;color:white;border:none;border-radius:6px;cursor:pointer}

/* MODAL */
.modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);align-items:center;justify-content:center}
.modal-overlay.active{display:flex}
.modal{background:white;padding:30px;border-radius:12px;width:400px}
.form-group input{width:100%;margin-bottom:10px;padding:8px}
.modal-actions{display:flex;justify-content:flex-end}

/* TOAST */
.toast{position:fixed;bottom:20px;right:20px;background:#16a34a;color:white;padding:12px 20px;border-radius:8px;display:none}
.toast.show{display:block}
.toast.success{background:#16a34a}
.toast.error{background:#dc2626}

/* SEARCH INPUT */
.input-search{padding:8px 12px;width:250px;margin-right:10px;border-radius:8px;border:1px solid #ccc}
</style>
</head>
<body>

<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" data-module="dashboard">Dashboard</div>
  <div class="menu-item" data-module="customers">Clientes</div>
  <div class="menu-item" data-module="boats">Botes</div>
  <div class="menu-item" data-module="rentals">Alquileres</div>
  <div class="menu-item" data-module="payments">Pagos</div>
  <div class="menu-item" data-module="reports">Reportes</div>
  <div class="menu-item" data-module="settings">Configuración</div>
</div>

<div class="header">
  <div>Panel Administrativo</div>
  <div>Admin</div>
</div>

<div class="content" id="mainContent">
  <!-- Dashboard content inicial -->
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

<div id="customerModal" class="modal-overlay">
  <div class="modal">
    <h3>Cliente</h3>
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

<script>
/* =========================
   DASHBOARD
========================= */
async function loadDashboard(){
  const res = await fetch("/api/dashboard");
  const data = await res.json();
  document.getElementById("income").innerText = "$" + data.income_today;
  document.getElementById("active").innerText = data.active_rentals;
  document.getElementById("boats").innerText = data.available_boats;
  document.getElementById("customers").innerText = data.total_customers;

  const values = [data.income_today,data.active_rentals,data.available_boats,data.total_customers];

  new Chart(document.getElementById("barChart"),{type:"bar",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}})
  new Chart(document.getElementById("lineChart"),{type:"line",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values,tension:0.4}]}})
  new Chart(document.getElementById("pieChart"),{type:"pie",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}})
}

/* =========================
   CLIENTES
========================= */
async function loadCustomers() {
  const container = document.getElementById("mainContent");
  container.innerHTML = `
    <div class="module-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div><h2>Clientes</h2><p class="subtitle">Gestión de clientes</p></div>
      <div>
        <input id="searchInput" class="input-search" placeholder="Buscar por nombre o documento..." />
        <button class="btn-primary" onclick="openCustomerModal()">+ Nuevo</button>
      </div>
    </div>
    <div class="card">
      <div id="loader">Cargando clientes...</div>
      <div id="customerTable"></div>
    </div>
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
    const filtered = data.filter(c => c.full_name.toLowerCase().includes(value) || c.document_id.toLowerCase().includes(value));
    renderCustomerTable(filtered);
  });
}

function renderCustomerTable(data) {
  if(!data.length){
    document.getElementById("customerTable").innerHTML = "<p>No hay clientes registrados.</p>";
    return;
  }
  let html = `<table class="data-table"><thead><tr>
      <th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th>
  </tr></thead><tbody>`;
  data.forEach(c => {
    html += `<tr>
      <td>${c.full_name}</td>
      <td>${c.document_id}</td>
      <td>${c.phone||'-'}</td>
      <td>${c.email||'-'}</td>
      <td>
        <button class="btn-primary" onclick="editCustomer(${c.id})">Editar</button>
        <button class="btn-danger-sm" onclick="deleteCustomer(${c.id})">Eliminar</button>
      </td>
    </tr>`;
  });
  html += "</tbody></table>";
  document.getElementById("customerTable").innerHTML = html;
}

function openCustomerModal(){
  document.getElementById("customerModal").classList.add("active");
  document.getElementById("name").value = "";
  document.getElementById("doc").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
  window.editingId = null;
}

function closeCustomerModal(){
  document.getElementById("customerModal").classList.remove("active");
}

async function saveCustomer(){
  const body = {
    full_name: document.getElementById("name").value,
    document_id: document.getElementById("doc").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value
  };
  let method = "POST";
  let url = "/api/customers";
  if(window.editingId){
    method = "PUT";
    url += "/" + window.editingId;
  }
  const res = await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(res.ok){
    showToast("Cliente guardado","success");
    closeCustomerModal();
    fetchCustomers();
  } else {
    showToast("Error al guardar cliente","error");
  }
}

async function editCustomer(id){
  const res = await fetch("/api/customers/"+id);
  const c = await res.json();
  document.getElementById("name").value = c.full_name;
  document.getElementById("doc").value = c.document_id;
  document.getElementById("phone").value = c.phone||"";
  document.getElementById("email").value = c.email||"";
  window.editingId = id;
  openCustomerModal();
}

async function deleteCustomer(id){
  if(!confirm("¿Eliminar cliente?")) return;
  await fetch("/api/customers/"+id,{method:"DELETE"});
  showToast("Cliente eliminado","success");
  fetchCustomers();
}

function showToast(msg,type){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.className = "toast show "+type;
  setTimeout(()=>t.className="toast",3000);
}

/* =========================
   MENU
========================= */
document.querySelectorAll(".menu-item").forEach(item=>{
  item.addEventListener("click",()=>{
    document.querySelectorAll(".menu-item").forEach(i=>i.classList.remove("active"));
    item.classList.add("active");
    const module = item.dataset.module;
    if(module==="dashboard") loadDashboard();
    else if(module==="customers") loadCustomers();
  });
});

/* CARGAR DASHBOARD INICIAL */
loadDashboard();
</script>
</body></html>`,{headers:{"Content-Type":"text/html"}});
      }

      /* =============================
         API DASHBOARD
      ============================== */
      if(url.pathname==="/api/dashboard"){
        const income = await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')").first();
        const active = await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE status='active'").first();
        const boats = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE status='available'").first();
        const customers = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
        return json({income_today:income.total,active_rentals:active.total,available_boats:boats.total,total_customers:customers.total});
      }

      /* =============================
         API CUSTOMERS
      ============================== */
      if(url.pathname.startsWith("/api/customers")){
        const id = url.pathname.split("/").pop();
        if(request.method==="GET" && !isNaN(id)){
          const c = await env.DB.prepare("SELECT * FROM customers WHERE id=?").bind(id).first();
          return json(c||{error:"Not found"},c?200:404);
        }
        if(request.method==="GET"){
          const all = await env.DB.prepare("SELECT * FROM customers ORDER BY id DESC").all();
          return json(all.results);
        }
        if(request.method==="POST"){
          const data = await request.json();
          await env.DB.prepare("INSERT INTO customers (full_name,document_id,phone,email) VALUES (?,?,?,?)")
            .bind(data.full_name,data.document_id,data.phone||"",data.email||"").run();
          return json({ok:true});
        }
        if(request.method==="PUT" && !isNaN(id)){
          const data = await request.json();
          await env.DB.prepare("UPDATE customers SET full_name=?,document_id=?,phone=?,email=? WHERE id=?")
            .bind(data.full_name,data.document_id,data.phone||"",data.email||"",id).run();
          return json({ok:true});
        }
        if(request.method==="DELETE" && !isNaN(id)){
          await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      return json({error:"Not Found"},404);

    } catch(err){
      return json({error:err.message},500);
    }
  }
}

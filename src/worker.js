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
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Boat Rental ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',sans-serif}
body{background:#f1f5f9}
.sidebar{width:240px;height:100vh;background:#0f172a;color:#fff;position:fixed;padding:25px 20px}
.sidebar h2{margin-bottom:40px;font-weight:700}
.menu-item{padding:12px 14px;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:.2s}
.menu-item:hover{background:#1e293b}
.menu-item.active{background:#2563eb}
.header{margin-left:240px;height:65px;background:#1e3a8a;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:white;font-weight:600}
.content{margin-left:240px;padding:30px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.card{background:white;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05)}
.card h4{margin:0;font-weight:600;color:#64748b}
.card h2{margin:10px 0 0 0}
.charts{margin-top:40px;display:grid;grid-template-columns:repeat(2,1fr);gap:30px}
.chart-box{background:white;padding:25px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05)}
.full-width{grid-column:span 2}
.input-search{padding:8px 12px;border-radius:8px;border:1px solid #ccc;width:250px;margin-right:10px}
.btn-primary{padding:8px 15px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer}
.btn-success{padding:8px 15px;background:#16a34a;color:white;border:none;border-radius:8px;cursor:pointer}
.btn-secondary{padding:8px 15px;background:#ccc;color:#000;border:none;border-radius:8px;cursor:pointer}
.btn-danger-sm{padding:5px 10px;background:#dc2626;color:white;border:none;border-radius:6px;cursor:pointer}
.modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);align-items:center;justify-content:center}
.modal-overlay.active{display:flex}
.modal{background:white;padding:30px;border-radius:12px;width:400px}
.modal-actions{text-align:right;margin-top:15px}
.toast{position:fixed;bottom:20px;right:20px;background:#16a34a;color:white;padding:12px 20px;border-radius:8px;display:none}
.toast.show.success{background:#16a34a}
.toast.show.error{background:#dc2626}
.data-table{width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden}
.data-table th, .data-table td{padding:10px;text-align:left;border-bottom:1px solid #eee}
.empty-state{text-align:center;color:#64748b;padding:20px}
.module-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
</style>
</head>
<body>
<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="showModule('dashboard')">Dashboard</div>
  <div class="menu-item" onclick="showModule('customers')">Clientes</div>
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
<div class="content" id="mainContent">
  <!-- DASHBOARD -->
  <div id="dashboardModule">
    <div class="cards">
      <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
      <div class="card"><h4>Alquileres Activos</h4><h2 id="active">0</h2></div>
      <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
    </div>
    <div class="charts">
      <div class="chart-box"><h4>Resumen General (Barras)</h4><canvas id="barChart"></canvas></div>
      <div class="chart-box"><h4>Tendencia (Línea)</h4><canvas id="lineChart"></canvas></div>
      <div class="chart-box full-width"><h4>Distribución (Pie)</h4><canvas id="pieChart"></canvas></div>
    </div>
  </div>
</div>

<!-- MODAL CLIENTES -->
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

<script>
/* DASHBOARD */
async function loadDashboard(){
  const res = await fetch("/api/dashboard");
  const data = await res.json();
  document.getElementById("income").innerText = "$"+data.income_today;
  document.getElementById("active").innerText = data.active_rentals;
  document.getElementById("boats").innerText = data.available_boats;
  document.getElementById("customers").innerText = data.total_customers;

  const values = [data.income_today, data.active_rentals, data.available_boats, data.total_customers];

  new Chart(document.getElementById("barChart"),{
    type:"bar",
    data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}
  });
  new Chart(document.getElementById("lineChart"),{
    type:"line",
    data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values,tension:0.4}]}
  });
  new Chart(document.getElementById("pieChart"),{
    type:"pie",
    data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}
  });
}

/* MODULO CLIENTES */
let customersData = [];
async function loadCustomers() {
  document.getElementById("mainContent").innerHTML = `
    <div class="module-header">
      <div><h2>Clientes</h2><p class="subtitle">Gestión y administración de clientes registrados</p></div>
      <div>
        <input id="searchInput" class="input-search" placeholder="Buscar por nombre o documento..." />
        <button class="btn-primary" onclick="openCustomerModal()">+ Nuevo Cliente</button>
      </div>
    </div>
    <div class="card">
      <div id="loader">Cargando clientes...</div>
      <div id="customerTable"></div>
    </div>
  `;

  await fetchCustomers();

  document.getElementById("searchInput").addEventListener("input", e=>{
    const value = e.target.value.toLowerCase();
    const filtered = customersData.filter(c =>
      c.full_name.toLowerCase().includes(value) ||
      c.document_id.toLowerCase().includes(value)
    );
    renderCustomerTable(filtered);
  });
}

async function fetchCustomers(){
  document.getElementById("loader").style.display="block";
  const res = await fetch("/api/customers");
  const data = await res.json();
  customersData = data;
  document.getElementById("loader").style.display="none";
  renderCustomerTable(data);
}

function renderCustomerTable(data){
  if(data.length===0){
    document.getElementById("customerTable").innerHTML=`<div class="empty-state"><p>No hay clientes registrados.</p></div>`;
    return;
  }
  let html=`<table class="data-table">
    <thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody>`;
  data.forEach(c=>{
    html+=`<tr>
      <td>${c.full_name}</td>
      <td>${c.document_id}</td>
      <td>${c.phone||"-"}</td>
      <td>${c.email||"-"}</td>
      <td>
        <button class="btn-danger-sm" onclick="deleteCustomer(${c.id})">Eliminar</button>
      </td>
    </tr>`;
  });
  html+="</tbody></table>";
  document.getElementById("customerTable").innerHTML=html;
}

function openCustomerModal(){document.getElementById("customerModal").classList.add("active")}
function closeCustomerModal(){document.getElementById("customerModal").classList.remove("active")}

async function saveCustomer(){
  const body={
    full_name:document.getElementById("name").value,
    document_id:document.getElementById("doc").value,
    phone:document.getElementById("phone").value,
    email:document.getElementById("email").value
  };
  const res = await fetch("/api/customers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(res.ok){showToast("Cliente creado correctamente","success");closeCustomerModal();fetchCustomers();}
  else showToast("Error al crear cliente","error");
}

async function deleteCustomer(id){
  if(!confirm("¿Seguro que deseas eliminar este cliente?")) return;
  await fetch("/api/customers/"+id,{method:"DELETE"});
  showToast("Cliente eliminado","success");
  fetchCustomers();
}

function showToast(msg,type){
  const toast=document.getElementById("toast");
  toast.innerText=msg;
  toast.className="toast show "+type;
  setTimeout(()=>{toast.className="toast";},3000);
}

/* SWITCH MODULES */
function showModule(mod){
  document.getElementById("mainContent").innerHTML="";
  if(mod==="dashboard"){document.getElementById("mainContent").innerHTML=document.getElementById("dashboardModule").outerHTML;loadDashboard();}
  else if(mod==="customers"){loadCustomers();}
}

loadDashboard();
</script>
</body>
</html>`,{
          headers:{"Content-Type":"text/html"}
        });
      }

      /* =============================
         API DASHBOARD
      ============================== */
      if(url.pathname==="/api/dashboard"){
        const income = await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')").first();
        const active = await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE status='active'").first();
        const boats = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE status='available'").first();
        const customers = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
        return json({
          income_today:income.total,
          active_rentals:active.total,
          available_boats:boats.total,
          total_customers:customers.total
        });
      }

      /* =============================
         API CUSTOMERS
      ============================== */
      if(url.pathname.startsWith("/api/customers")){
        if(request.method==="GET"){
          const all = await env.DB.prepare("SELECT * FROM customers").all();
          return json(all.results);
        }
        if(request.method==="POST"){
          const body = await request.json();
          const res = await env.DB.prepare("INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)")
            .bind(body.full_name,body.document_id,body.phone,body.email).run();
          return json({ok:true});
        }
        if(request.method==="DELETE"){
          const id = url.pathname.split("/").pop();
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

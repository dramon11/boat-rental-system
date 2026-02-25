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
         FRONTEND
      ============================== */
      if (url.pathname === "/" && request.method === "GET") {
        return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Boat Rental SaaS</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
body{margin:0;font-family:Inter;background:#f1f5f9}
.sidebar{width:240px;height:100vh;background:#0f172a;color:#fff;position:fixed;padding:25px}
.sidebar h2{margin-bottom:30px}
.menu-item{padding:12px;border-radius:8px;margin-bottom:8px;cursor:pointer}
.menu-item:hover{background:#1e293b}
.header{margin-left:240px;height:60px;background:#1e3a8a;color:#fff;display:flex;align-items:center;padding:0 25px}
.content{margin-left:240px;padding:30px}
.card{background:#fff;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.05);margin-bottom:20px}
button{cursor:pointer}
</style>
</head>

<body>

<div class="sidebar">
  <h2>⚓ Boat ERP</h2>
  <div class="menu-item" onclick="loadDashboard()">Dashboard</div>
  <div class="menu-item" onclick="loadCustomers()">Clientes</div>
</div>

<div class="header">Panel Administrativo</div>
<div class="content" id="mainContent"></div>

<script>

/* ================= DASHBOARD ================= */

async function loadDashboard(){
  document.getElementById("mainContent").innerHTML = \`
    <div class="card">
      <h3>Resumen</h3>
      <p>Ingresos Hoy: <span id="income">0</span></p>
      <p>Alquileres Activos: <span id="active">0</span></p>
      <p>Botes Disponibles: <span id="boats">0</span></p>
      <p>Total Clientes: <span id="customers">0</span></p>
    </div>
    <div class="card"><canvas id="chart"></canvas></div>
  \`;

  const res = await fetch("/api/dashboard");
  const data = await res.json();

  document.getElementById("income").innerText = data.income_today;
  document.getElementById("active").innerText = data.active_rentals;
  document.getElementById("boats").innerText = data.available_boats;
  document.getElementById("customers").innerText = data.total_customers;

  new Chart(document.getElementById("chart"),{
    type:"bar",
    data:{
      labels:["Ingresos","Activos","Disponibles","Clientes"],
      datasets:[{data:[
        data.income_today,
        data.active_rentals,
        data.available_boats,
        data.total_customers
      ]}]
    }
  });
}

/* ================= CLIENTES ================= */

async function loadCustomers(){
  document.getElementById("mainContent").innerHTML = \`
    <div class="card">
      <h3>Clientes</h3>
      <button onclick="openModal()">+ Nuevo</button>
      <div id="table"></div>
    </div>

    <div id="modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,.4);align-items:center;justify-content:center">
      <div style="background:#fff;padding:20px;border-radius:12px;width:300px">
        <h4>Nuevo Cliente</h4>
        <input id="name" placeholder="Nombre" style="width:100%;margin-bottom:8px">
        <input id="doc" placeholder="Documento" style="width:100%;margin-bottom:8px">
        <button onclick="saveCustomer()">Guardar</button>
        <button onclick="closeModal()">Cancelar</button>
      </div>
    </div>
  \`;

  fetchCustomers();
}

async function fetchCustomers(){
  const res = await fetch("/api/customers");
  const data = await res.json();

  let html="<table width='100%'><tr><th>Nombre</th><th>Documento</th><th></th></tr>";
  data.forEach(c=>{
    html+=\`<tr>
      <td>\${c.full_name}</td>
      <td>\${c.document_id}</td>
      <td><button onclick="deleteCustomer(\${c.id})">Eliminar</button></td>
    </tr>\`;
  });
  html+="</table>";

  document.getElementById("table").innerHTML=html;
}

function openModal(){ document.getElementById("modal").style.display="flex"; }
function closeModal(){ document.getElementById("modal").style.display="none"; }

async function saveCustomer(){
  await fetch("/api/customers",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      full_name:document.getElementById("name").value,
      document_id:document.getElementById("doc").value
    })
  });
  closeModal();
  fetchCustomers();
}

async function deleteCustomer(id){
  await fetch("/api/customers/"+id,{method:"DELETE"});
  fetchCustomers();
}

loadDashboard();

</script>

</body>
</html>
        `,{ headers:{"Content-Type":"text/html"}});
      }

      /* =============================
         API CLIENTES
      ============================== */

      if (url.pathname === "/api/customers" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY id DESC").all();
        return json(results);
      }

      if (url.pathname === "/api/customers" && request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO customers (full_name, document_id) VALUES (?,?)"
        ).bind(body.full_name, body.document_id).run();
        return json({success:true});
      }

      if (url.pathname.startsWith("/api/customers/") && request.method === "DELETE") {
        const id = url.pathname.split("/").pop();
        await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
        return json({success:true});
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

    } catch(err){
      return json({error:err.message},500);
    }
  }
};

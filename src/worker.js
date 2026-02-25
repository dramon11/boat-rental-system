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
<meta charset="UTF-8"/>
<title>Boat Rental ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
*{box-sizing:border-box}
body{margin:0;font-family:'Inter',sans-serif;background:#f1f5f9}

.sidebar{
  width:240px;height:100vh;background:#0f172a;color:#fff;
  position:fixed;padding:25px 20px;
}
.sidebar h2{margin:0 0 40px 0}
.menu-item{
  padding:12px;border-radius:8px;margin-bottom:10px;
  cursor:pointer;transition:.2s
}
.menu-item:hover{background:#1e293b}
.menu-item.active{background:#2563eb}

.header{
  margin-left:240px;height:65px;background:#1e3a8a;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 30px;color:white;font-weight:600
}

.content{
  margin-left:240px;padding:30px
}

.cards{
  display:grid;grid-template-columns:repeat(4,1fr);gap:20px
}

.card{
  background:white;padding:20px;border-radius:14px;
  box-shadow:0 6px 20px rgba(0,0,0,0.05)
}

.charts{
  margin-top:40px;display:grid;
  grid-template-columns:repeat(2,1fr);gap:30px
}

.chart-box{
  background:white;padding:25px;border-radius:14px;
  box-shadow:0 6px 20px rgba(0,0,0,0.05)
}

.full-width{grid-column:span 2}

/* TABLE */
.data-table{
  width:100%;border-collapse:collapse
}
.data-table th{
  background:#f1f5f9;padding:12px;text-align:left
}
.data-table td{
  padding:12px;border-top:1px solid #eee
}

/* BUTTONS */
.btn{
  padding:8px 12px;border:none;border-radius:6px;cursor:pointer
}
.btn-primary{background:#2563eb;color:white}
.btn-danger{background:#dc2626;color:white}
.btn-success{background:#16a34a;color:white}

/* MODAL */
.modal-overlay{
  display:none;position:fixed;top:0;left:0;width:100%;height:100%;
  background:rgba(0,0,0,.4);align-items:center;justify-content:center
}
.modal{
  background:white;padding:25px;border-radius:12px;width:400px
}
.modal input{
  width:100%;margin-bottom:10px;padding:8px
}

.toast{
  position:fixed;bottom:20px;right:20px;
  padding:12px 20px;border-radius:8px;
  display:none;color:white
}
.toast.success{background:#16a34a}
.toast.error{background:#dc2626}
</style>
</head>

<body>

<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="showDashboard()">Dashboard</div>
  <div class="menu-item" onclick="loadCustomers()">Clientes</div>
</div>

<div class="header">
  <div>Panel Administrativo</div>
  <div>Admin</div>
</div>

<div class="content" id="mainContent"></div>

<script>

/* ================= DASHBOARD ================= */

async function showDashboard(){

  document.getElementById("mainContent").innerHTML = \`
    <div class="cards">
      <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">0</h2></div>
      <div class="card"><h4>Activos</h4><h2 id="active">0</h2></div>
      <div class="card"><h4>Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="card"><h4>Clientes</h4><h2 id="customers">0</h2></div>
    </div>

    <div class="charts">
      <div class="chart-box"><canvas id="barChart"></canvas></div>
      <div class="chart-box"><canvas id="lineChart"></canvas></div>
      <div class="chart-box full-width"><canvas id="pieChart"></canvas></div>
    </div>
  \`;

  const res = await fetch("/api/dashboard");
  const data = await res.json();

  document.getElementById("income").innerText=data.income_today;
  document.getElementById("active").innerText=data.active_rentals;
  document.getElementById("boats").innerText=data.available_boats;
  document.getElementById("customers").innerText=data.total_customers;

  const values=[data.income_today,data.active_rentals,data.available_boats,data.total_customers];

  new Chart(barChart,{type:"bar",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}})
  new Chart(lineChart,{type:"line",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values,tension:.4}]}})
  new Chart(pieChart,{type:"pie",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}})
}


/* ================= CLIENTES ================= */

async function loadCustomers(){

  document.getElementById("mainContent").innerHTML=\`
    <div style="display:flex;justify-content:space-between;margin-bottom:20px">
      <h2>Clientes</h2>
      <button class="btn btn-primary" onclick="openModal()">+ Nuevo</button>
    </div>
    <div id="customerTable"></div>

    <div id="modal" class="modal-overlay">
      <div class="modal">
        <h3>Nuevo Cliente</h3>
        <input id="name" placeholder="Nombre completo"/>
        <input id="doc" placeholder="Documento"/>
        <input id="phone" placeholder="Teléfono"/>
        <input id="email" placeholder="Email"/>
        <button class="btn btn-success" onclick="saveCustomer()">Guardar</button>
        <button class="btn" onclick="closeModal()">Cancelar</button>
      </div>
    </div>

    <div id="toast" class="toast"></div>
  \`;

  fetchCustomers();
}

async function fetchCustomers(){
  const res=await fetch("/api/customers");
  const data=await res.json();

  let html=\`<table class="data-table">
  <tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th></th></tr>\`;

  data.forEach(c=>{
    html+=\`<tr>
      <td>\${c.full_name}</td>
      <td>\${c.document_id}</td>
      <td>\${c.phone||""}</td>
      <td>\${c.email||""}</td>
      <td><button class="btn btn-danger" onclick="deleteCustomer(\${c.id})">Eliminar</button></td>
    </tr>\`;
  });

  html+="</table>";
  document.getElementById("customerTable").innerHTML=html;
}

function openModal(){document.getElementById("modal").style.display="flex"}
function closeModal(){document.getElementById("modal").style.display="none"}

async function saveCustomer(){
  const body={
    full_name:name.value,
    document_id:doc.value,
    phone:phone.value,
    email:email.value
  };

  const res=await fetch("/api/customers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(res.ok){
    showToast("Cliente creado","success");
    closeModal();
    fetchCustomers();
  }
}

async function deleteCustomer(id){
  if(!confirm("¿Eliminar cliente?")) return;
  await fetch("/api/customers/"+id,{method:"DELETE"});
  showToast("Cliente eliminado","success");
  fetchCustomers();
}

function showToast(msg,type){
  const t=document.getElementById("toast");
  t.innerText=msg;
  t.className="toast "+type;
  t.style.display="block";
  setTimeout(()=>t.style.display="none",3000);
}

/* INIT */
showDashboard();

</script>

</body>
</html>

        `,{headers:{"Content-Type":"text/html"}});
      }

      /* ================= API ================= */

      if (url.pathname === "/api/dashboard") {
        const income = await env.DB.prepare(
          "SELECT IFNULL(SUM(total_amount),0) as total FROM rentals"
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

      if (url.pathname === "/api/customers" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY id DESC").all();
        return json(results);
      }

      if (url.pathname === "/api/customers" && request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO customers (full_name,document_id,phone,email) VALUES (?,?,?,?)"
        ).bind(body.full_name,body.document_id,body.phone,body.email).run();
        return json({success:true});
      }

      if (url.pathname.startsWith("/api/customers/") && request.method==="DELETE") {
        const id=url.pathname.split("/").pop();
        await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
        return json({success:true});
      }

      return json({error:"Not Found"},404);

    } catch (err) {
      return json({error:err.message},500);
    }
  }
};

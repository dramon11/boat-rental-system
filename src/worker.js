export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    try {

      /* =====================================================
         FRONTEND COMPLETO ERP
      ===================================================== */
      if (url.pathname === "/" && request.method === "GET") {
        return new Response(`

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Boat Rental ERP</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body{margin:0;font-family:Arial;background:#f1f5f9}
.sidebar{width:230px;height:100vh;background:#0f172a;color:white;position:fixed;padding:20px}
.sidebar h2{margin-bottom:30px}
.menu-item{padding:10px;border-radius:6px;margin-bottom:10px;cursor:pointer}
.menu-item:hover{background:#1e293b}
.menu-item.active{background:#2563eb}
.header{margin-left:230px;height:60px;background:#1e3a8a;color:white;display:flex;align-items:center;padding:0 20px}
.content{margin-left:230px;padding:25px}
.card{background:white;padding:20px;border-radius:12px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;background:white}
th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}
button{padding:6px 10px;border:none;border-radius:5px;cursor:pointer}
.btn-primary{background:#2563eb;color:white}
.btn-danger{background:#dc2626;color:white}
.btn-success{background:#16a34a;color:white}
.modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);display:none;align-items:center;justify-content:center}
.modal-box{background:white;padding:20px;border-radius:10px;width:400px}
input,select{width:100%;margin-bottom:10px;padding:6px}
</style>
</head>

<body>

<div class="sidebar">
<h2>⚓ BoatERP</h2>
<div class="menu-item active" onclick="showDashboard()">Dashboard</div>
<div class="menu-item" onclick="loadCustomers()">Clientes</div>
<div class="menu-item" onclick="loadBoats()">Botes</div>
<div class="menu-item" onclick="loadRentals()">Alquileres</div>
</div>

<div class="header">Panel Administrativo</div>
<div class="content" id="main"></div>

<script>

/* ================= DASHBOARD ================= */

async function showDashboard(){
document.getElementById("main").innerHTML=`
<div class="card"><canvas id="chart"></canvas></div>`;
const res=await fetch("/api/dashboard");
const d=await res.json();
new Chart(chart,{
type:"bar",
data:{labels:["Ingresos","Activos","Disponibles","Clientes"],
datasets:[{data:[d.income_today,d.active_rentals,d.available_boats,d.total_customers]}]}
});
}

/* ================= CLIENTES ================= */

async function loadCustomers(){
const res=await fetch("/api/customers");
const data=await res.json();
let html=`<div style="display:flex;justify-content:space-between">
<h2>Clientes</h2>
<button class="btn-primary" onclick="openCustomer()">+ Nuevo</button></div>`;
html+=`<table><tr><th>Nombre</th><th>Doc</th><th>Tel</th><th>Email</th><th></th></tr>`;
data.forEach(c=>{
html+=`<tr>
<td>${c.full_name}</td>
<td>${c.document_id}</td>
<td>${c.phone||""}</td>
<td>${c.email||""}</td>
<td><button class="btn-danger" onclick="deleteCustomer(${c.id})">X</button></td>
</tr>`;
});
html+=`</table>
<div class="modal" id="modalCustomer">
<div class="modal-box">
<h3>Nuevo Cliente</h3>
<input id="cname" placeholder="Nombre"/>
<input id="cdoc" placeholder="Documento"/>
<input id="cphone" placeholder="Teléfono"/>
<input id="cemail" placeholder="Email"/>
<button class="btn-success" onclick="saveCustomer()">Guardar</button>
<button onclick="closeModal('modalCustomer')">Cancelar</button>
</div></div>`;
document.getElementById("main").innerHTML=html;
}

function openCustomer(){document.getElementById("modalCustomer").style.display="flex"}
function closeModal(id){document.getElementById(id).style.display="none"}

async function saveCustomer(){
await fetch("/api/customers",{method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({
full_name:cname.value,
document_id:cdoc.value,
phone:cphone.value,
email:cemail.value})});
loadCustomers();
}

async function deleteCustomer(id){
await fetch("/api/customers/"+id,{method:"DELETE"});
loadCustomers();
}

/* ================= BOTES ================= */

async function loadBoats(){
const res=await fetch("/api/boats");
const data=await res.json();
let html=`<div style="display:flex;justify-content:space-between">
<h2>Botes</h2>
<button class="btn-primary" onclick="openBoat()">+ Nuevo</button></div>`;
html+=`<table><tr><th>Nombre</th><th>Tipo</th><th>Cap</th><th>Precio/h</th><th>Status</th></tr>`;
data.forEach(b=>{
html+=`<tr>
<td>${b.name}</td>
<td>${b.type}</td>
<td>${b.capacity}</td>
<td>${b.price_per_hour}</td>
<td>${b.status}</td>
</tr>`;
});
html+=`<div class="modal" id="modalBoat">
<div class="modal-box">
<h3>Nuevo Bote</h3>
<input id="bname" placeholder="Nombre"/>
<input id="btype" placeholder="Tipo"/>
<input id="bcap" placeholder="Capacidad"/>
<input id="bprice" placeholder="Precio/hora"/>
<button class="btn-success" onclick="saveBoat()">Guardar</button>
<button onclick="closeModal('modalBoat')">Cancelar</button>
</div></div>`;
document.getElementById("main").innerHTML=html;
}

function openBoat(){document.getElementById("modalBoat").style.display="flex"}

async function saveBoat(){
await fetch("/api/boats",{method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({
name:bname.value,type:btype.value,
capacity:bcap.value,price_per_hour:bprice.value})});
loadBoats();
}

/* ================= ALQUILERES ================= */

async function loadRentals(){
const res=await fetch("/api/rentals");
const data=await res.json();
let html=`<h2>Alquileres</h2><table>
<tr><th>Cliente</th><th>Bote</th><th>Total</th><th>Status</th></tr>`;
data.forEach(r=>{
html+=`<tr>
<td>${r.customer_name}</td>
<td>${r.boat_name}</td>
<td>${r.total_amount}</td>
<td>${r.status}</td>
</tr>`;
});
html+=`</table>`;
document.getElementById("main").innerHTML=html;
}

showDashboard();
</script>
</body>
</html>

        `,{headers:{"Content-Type":"text/html"}});
      }

      /* ================= DASHBOARD API ================= */

      if (url.pathname === "/api/dashboard") {
        const income = await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) as total FROM rentals").first();
        const active = await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE status='active'").first();
        const boats = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE status='available'").first();
        const customers = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();

        return json({
          income_today: income.total,
          active_rentals: active.total,
          available_boats: boats.total,
          total_customers: customers.total
        });
      }

      /* ================= CLIENTES API ================= */

      if (url.pathname === "/api/customers" && request.method==="GET"){
        const {results}=await env.DB.prepare("SELECT * FROM customers ORDER BY id DESC").all();
        return json(results);
      }

      if (url.pathname === "/api/customers" && request.method==="POST"){
        const body=await request.json();
        await env.DB.prepare(
          "INSERT INTO customers(full_name,document_id,phone,email) VALUES(?,?,?,?)"
        ).bind(body.full_name,body.document_id,body.phone,body.email).run();
        return json({success:true});
      }

      if (url.pathname.startsWith("/api/customers/") && request.method==="DELETE"){
        const id=url.pathname.split("/").pop();
        await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
        return json({success:true});
      }

      /* ================= BOTES API ================= */

      if (url.pathname === "/api/boats" && request.method==="GET"){
        const {results}=await env.DB.prepare("SELECT * FROM boats ORDER BY id DESC").all();
        return json(results);
      }

      if (url.pathname === "/api/boats" && request.method==="POST"){
        const body=await request.json();
        await env.DB.prepare(
          "INSERT INTO boats(name,type,capacity,price_per_hour,status) VALUES(?,?,?,?, 'available')"
        ).bind(body.name,body.type,body.capacity,body.price_per_hour).run();
        return json({success:true});
      }

      /* ================= RENTALS API ================= */

      if (url.pathname === "/api/rentals" && request.method==="GET"){
        const {results}=await env.DB.prepare(
          \`SELECT r.*, c.full_name as customer_name, b.name as boat_name
           FROM rentals r
           JOIN customers c ON r.customer_id=c.id
           JOIN boats b ON r.boat_id=b.id
           ORDER BY r.id DESC\`
        ).all();
        return json(results);
      }

      return json({error:"Not Found"},404);

    } catch (err) {
      return json({error:err.message},500);
    }
  }
};

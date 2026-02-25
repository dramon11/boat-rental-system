export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    try {

      /* ===============================
         FRONTEND ERP
      =============================== */
      if (url.pathname === "/" && request.method === "GET") {

        return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Boat Rental ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
body{margin:0;font-family:Inter;background:#f1f5f9}
.sidebar{width:230px;height:100vh;background:#0f172a;color:white;position:fixed;padding:25px}
.menu-item{padding:12px;border-radius:8px;margin-bottom:10px;cursor:pointer}
.menu-item:hover{background:#1e293b}
.header{margin-left:230px;background:#1e3a8a;color:white;padding:15px 30px;font-weight:600}
.content{margin-left:230px;padding:30px}
.card{background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.08);margin-bottom:20px}
button{padding:8px 12px;border:none;border-radius:6px;cursor:pointer}
.btn-primary{background:#2563eb;color:white}
.btn-danger{background:#dc2626;color:white}
input,select{padding:8px;margin-bottom:10px;width:100%;border-radius:6px;border:1px solid #ccc}
table{width:100%;border-collapse:collapse}
th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}
th{background:#f1f5f9}
</style>
</head>

<body>

<div class="sidebar">
<h2>⚓ BoatERP</h2>
<div class="menu-item" onclick="loadDashboard()">Dashboard</div>
<div class="menu-item" onclick="loadCustomers()">Clientes</div>
<div class="menu-item" onclick="loadBoats()">Botes</div>
<div class="menu-item" onclick="loadRentals()">Alquileres</div>
</div>

<div class="header">Panel Administrativo</div>
<div class="content" id="main"></div>

<script>

/* ================= DASHBOARD ================= */

async function loadDashboard(){
  const res = await fetch("/api/dashboard");
  const data = await res.json();

  document.getElementById("main").innerHTML =
  '<div class="card"><h3>Ingresos Hoy: $'+data.income_today+'</h3></div>' +
  '<div class="card"><canvas id="chart"></canvas></div>';

  new Chart(document.getElementById("chart"),{
    type:"bar",
    data:{
      labels:["Activos","Disponibles","Clientes"],
      datasets:[{data:[data.active_rentals,data.available_boats,data.total_customers]}]
    }
  });
}

/* ================= CLIENTES ================= */

async function loadCustomers(){
  const res = await fetch("/api/customers");
  const data = await res.json();

  let html = '<div class="card"><h3>Clientes</h3>';
  html += '<button class="btn-primary" onclick="showCustomerForm()">Nuevo</button><br><br>';
  html += '<table><tr><th>Nombre</th><th>Documento</th><th>Acciones</th></tr>';

  data.forEach(c=>{
    html += '<tr><td>'+c.full_name+'</td><td>'+c.document_id+'</td>' +
    '<td><button class="btn-danger" onclick="deleteCustomer('+c.id+')">Eliminar</button></td></tr>';
  });

  html += '</table></div>';
  document.getElementById("main").innerHTML = html;
}

function showCustomerForm(){
  document.getElementById("main").innerHTML =
  '<div class="card"><h3>Nuevo Cliente</h3>' +
  '<input id="name" placeholder="Nombre">' +
  '<input id="doc" placeholder="Documento">' +
  '<button class="btn-primary" onclick="saveCustomer()">Guardar</button></div>';
}

async function saveCustomer(){
  await fetch("/api/customers",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      full_name:document.getElementById("name").value,
      document_id:document.getElementById("doc").value
    })
  });
  loadCustomers();
}

async function deleteCustomer(id){
  await fetch("/api/customers/"+id,{method:"DELETE"});
  loadCustomers();
}

/* ================= BOTES ================= */

async function loadBoats(){
  const res = await fetch("/api/boats");
  const data = await res.json();

  let html = '<div class="card"><h3>Botes</h3>';
  html += '<button class="btn-primary" onclick="showBoatForm()">Nuevo</button><br><br>';
  html += '<table><tr><th>Nombre</th><th>Estado</th></tr>';

  data.forEach(b=>{
    html += '<tr><td>'+b.name+'</td><td>'+b.status+'</td></tr>';
  });

  html += '</table></div>';
  document.getElementById("main").innerHTML = html;
}

function showBoatForm(){
  document.getElementById("main").innerHTML =
  '<div class="card"><h3>Nuevo Bote</h3>' +
  '<input id="bname" placeholder="Nombre">' +
  '<input id="price" placeholder="Precio por Hora">' +
  '<button class="btn-primary" onclick="saveBoat()">Guardar</button></div>';
}

async function saveBoat(){
  await fetch("/api/boats",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      name:document.getElementById("bname").value,
      type:"lancha",
      capacity:5,
      price_per_hour:document.getElementById("price").value
    })
  });
  loadBoats();
}

/* ================= ALQUILERES ================= */

async function loadRentals(){
  document.getElementById("main").innerHTML =
  '<div class="card"><h3>Crear Alquiler</h3>' +
  '<input id="customer" placeholder="Customer ID">' +
  '<input id="boat" placeholder="Boat ID">' +
  '<input id="start" type="datetime-local">' +
  '<input id="end" type="datetime-local">' +
  '<button class="btn-primary" onclick="createRental()">Crear</button></div>';
}

async function createRental(){
  const res = await fetch("/api/rentals",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      customer_id:document.getElementById("customer").value,
      boat_id:document.getElementById("boat").value,
      start_datetime:document.getElementById("start").value,
      end_datetime:document.getElementById("end").value
    })
  });
  const data = await res.json();
  alert("Total: $" + data.total_amount);
}

/* INIT */
loadDashboard();

</script>
</body>
</html>
        `,{ headers:{ "Content-Type":"text/html" }});
      }

      /* ================= API ================= */

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

      if (url.pathname === "/api/customers" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM customers").all();
        return json(results);
      }

      if (url.pathname === "/api/customers" && request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO customers (full_name,document_id) VALUES (?,?)"
        ).bind(body.full_name,body.document_id).run();
        return json({success:true});
      }

      if (url.pathname.startsWith("/api/customers/") && request.method === "DELETE") {
        const id = url.pathname.split("/").pop();
        await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
        return json({success:true});
      }

      if (url.pathname === "/api/boats" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM boats").all();
        return json(results);
      }

      if (url.pathname === "/api/boats" && request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO boats (name,type,capacity,price_per_hour,status) VALUES (?,?,?,?,?)"
        ).bind(body.name,body.type,body.capacity,body.price_per_hour,"available").run();
        return json({success:true});
      }

      if (url.pathname === "/api/rentals" && request.method === "POST") {
        const body = await request.json();

        const boat = await env.DB.prepare("SELECT * FROM boats WHERE id=?")
          .bind(body.boat_id).first();

        if(!boat || boat.status !== "available")
          return json({error:"Boat not available"},400);

        const hours = (new Date(body.end_datetime)-new Date(body.start_datetime))/3600000;
        const total = hours * boat.price_per_hour;

        await env.DB.prepare(
          "INSERT INTO rentals (customer_id,boat_id,start_datetime,end_datetime,total_amount,status) VALUES (?,?,?,?,?,?)"
        ).bind(body.customer_id,body.boat_id,body.start_datetime,body.end_datetime,total,"active").run();

        await env.DB.prepare("UPDATE boats SET status='rented' WHERE id=?")
          .bind(body.boat_id).run();

        return json({success:true,total_amount:total});
      }

      return json({error:"Not Found"},404);

    } catch(err){
      return json({error:err.message},500);
    }
  }
};
